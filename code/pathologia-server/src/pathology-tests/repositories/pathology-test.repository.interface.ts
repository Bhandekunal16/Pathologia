import { TestCategory } from '../../shared/enums/test-category.enum';
import { Status } from '../../shared/enums/status.enum';
import { PathologyTestDocument } from '../schemas/pathology-test.schema';

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PathologyTestListFilter {
  page?: number;
  limit?: number;
  search?: string;
  category?: TestCategory;
  status?: Status;
}

export interface CreatePathologyTestData {
  name: string;
  code: string;
  category: TestCategory;
  specimenType: string;
  description?: string;
  manual: string;
  status?: Status;
}

export interface UpdatePathologyTestData {
  name?: string;
  code?: string;
  category?: TestCategory;
  specimenType?: string;
  description?: string;
  manual?: string;
  status?: Status;
}

export interface IPathologyTestRepository {
  create(data: CreatePathologyTestData): Promise<PathologyTestDocument>;
  findById(id: string): Promise<PathologyTestDocument | null>;
  findByCode(code: string): Promise<PathologyTestDocument | null>;
  findAll(filter: PathologyTestListFilter): Promise<PaginatedResult<PathologyTestDocument>>;
  update(id: string, data: UpdatePathologyTestData): Promise<PathologyTestDocument | null>;
  delete(id: string): Promise<boolean>;
}
