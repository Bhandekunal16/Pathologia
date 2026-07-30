import { PathologyTest } from '../types/pathology-test.types';

export interface BackendPathologyTest {
  id: string;
  name: string;
  code: string;
  category: PathologyTest['category'];
  specimenType: string;
  description?: string;
  manual: string;
  rate: number;
  status: PathologyTest['status'];
  createdAt: string;
  updatedAt: string;
}

export function mapPathologyTestFromApi(test: BackendPathologyTest): PathologyTest {
  return {
    id: test.id,
    name: test.name,
    code: test.code,
    category: test.category,
    specimenType: test.specimenType,
    description: test.description,
    manual: test.manual,
    rate: test.rate ?? 0,
    status: test.status,
    createdAt: test.createdAt,
    updatedAt: test.updatedAt,
  };
}
