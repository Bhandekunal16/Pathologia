import { PipelineStage, Types } from 'mongoose';
import { AuditAction } from '../../shared/enums/audit-action.enum';
import {
  AUDIT_LOG_FIELDS,
  DETAIL_FIELDS,
  USERS_COLLECTION,
  USER_PROJECTION,
} from '../constants/audit-log.constants';
import { AuditLogFilter } from '../interfaces/audit-log.interfaces';

const REGEX_ESCAPE_PATTERN = /[.*+?^${}()|[\]\\]/g;

export class AuditLogPipelineBuilder {
  static buildMatchFilter(filter: AuditLogFilter): Record<string, unknown> {
    const match: Record<string, unknown> = {};

    if (filter.action) {
      match.action = filter.action;
    }

    const searchFilter = this.buildSearchFilter(filter.search);
    if (searchFilter) {
      Object.assign(match, searchFilter);
    }

    return match;
  }

  /**
   * Builds a search filter compatible with future Atlas Search / text-index migration.
   * Uses exact matching where possible and regex only on free-text fields.
   */
  static buildSearchFilter(
    search?: string,
  ): Record<string, unknown> | null {
    const trimmed = search?.trim();
    if (!trimmed) {
      return null;
    }

    const orConditions: Record<string, unknown>[] = [];
    const matchingActions = this.findMatchingActions(trimmed);

    if (matchingActions.length > 0) {
      orConditions.push({ action: { $in: matchingActions } });
    }

    if (Types.ObjectId.isValid(trimmed) && trimmed.length === 24) {
      orConditions.push({ entityId: trimmed });
    }

    const regex = new RegExp(
      trimmed.replace(REGEX_ESCAPE_PATTERN, '\\$&'),
      'i',
    );
    orConditions.push({ entity: regex }, { entityId: regex });

    return { $or: orConditions };
  }

  static buildLookupStage(): PipelineStage.Lookup {
    return {
      $lookup: {
        from: USERS_COLLECTION,
        let: { userId: '$userId' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$_id', '$$userId'] },
            },
          },
          { $project: USER_PROJECTION },
        ],
        as: 'user',
      },
    };
  }

  static buildUnwindUserStage(): PipelineStage.Unwind {
    return {
      $unwind: {
        path: '$user',
        preserveNullAndEmptyArrays: true,
      },
    };
  }

  static buildPaginationFacet(
    skip: number,
    limit: number,
  ): PipelineStage.Facet {
    return {
      $facet: {
        items: [
          { $skip: skip },
          { $limit: limit },
          { $project: AUDIT_LOG_FIELDS },
          this.buildLookupStage(),
          this.buildUnwindUserStage(),
        ],
        total: [{ $count: 'count' }],
      },
    };
  }

  static buildPaginatedListPipeline(
    matchFilter: Record<string, unknown>,
    skip: number,
    limit: number,
  ): PipelineStage[] {
    return [
      { $match: matchFilter },
      { $sort: { createdAt: -1 } },
      this.buildPaginationFacet(skip, limit),
    ];
  }

  static buildDetailPipeline(id: Types.ObjectId): PipelineStage[] {
    return [
      { $match: { _id: id } },
      { $project: DETAIL_FIELDS },
      this.buildLookupStage(),
      this.buildUnwindUserStage(),
    ];
  }

  private static findMatchingActions(search: string): AuditAction[] {
    const normalized = search.toLowerCase();

    return Object.values(AuditAction).filter((action) =>
      action.toLowerCase().includes(normalized),
    );
  }
}
