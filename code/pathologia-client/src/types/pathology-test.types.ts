export type TestCategory =
  | 'BLOOD'
  | 'URINE'
  | 'IMAGING'
  | 'BODY_CHECKUP'
  | 'OTHER';

export type TestStatus = 'ACTIVE' | 'INACTIVE';

export interface PathologyTest {
  id: string;
  name: string;
  code: string;
  category: TestCategory;
  specimenType: string;
  description?: string;
  manual: string;
  status: TestStatus;
  rate: number;
  createdAt: string;
  updatedAt: string;
}

export interface PathologyTestFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
}

export interface CreatePathologyTestPayload {
  name: string;
  code: string;
  category: TestCategory;
  specimenType: string;
  description?: string;
  manual: string;
  rate?: number;
  status?: TestStatus;
}

export interface UpdatePathologyTestPayload {
  name?: string;
  code?: string;
  category?: TestCategory;
  specimenType?: string;
  description?: string;
  manual?: string;
  rate?: number;
  status?: TestStatus;
}

export const TEST_CATEGORY_LABELS: Record<TestCategory, string> = {
  BLOOD: 'Blood Test',
  URINE: 'Urine Test',
  IMAGING: 'Imaging',
  BODY_CHECKUP: 'Body Checkup',
  OTHER: 'Other',
};

export const TEST_CATEGORY_OPTIONS = Object.entries(TEST_CATEGORY_LABELS).map(
  ([value, label]) => ({ value, label }),
);
