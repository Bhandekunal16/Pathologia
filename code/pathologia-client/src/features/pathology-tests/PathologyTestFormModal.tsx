import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { pathologyTestSchema } from '../../utils/validators';
import { Input } from '../../components/forms/Input';
import { Select } from '../../components/forms/Select';
import { Textarea } from '../../components/forms/Textarea';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/ui/Button';
import {
  PathologyTest,
  TEST_CATEGORY_OPTIONS,
  TestCategory,
  TestStatus,
} from '../../types/pathology-test.types';

export interface PathologyTestFormData {
  name: string;
  code: string;
  category: TestCategory;
  specimenType: string;
  description?: string;
  manual: string;
  rate: number;
  status: TestStatus;
}

interface PathologyTestFormModalProps {
  isOpen: boolean;
  test?: PathologyTest | null;
  onClose: () => void;
  onSubmit: (data: PathologyTestFormData) => Promise<void>;
  isLoading?: boolean;
}

export const PathologyTestFormModal: React.FC<PathologyTestFormModalProps> = ({
  isOpen,
  test,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const isEdit = Boolean(test);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PathologyTestFormData>({
    resolver: zodResolver(pathologyTestSchema) as any,
    defaultValues: {
      name: test?.name || '',
      code: test?.code || '',
      category: test?.category || 'BLOOD',
      specimenType: test?.specimenType || '',
      description: test?.description || '',
      manual: test?.manual || '',
      rate: test?.rate ?? 0,
      status: test?.status || 'ACTIVE',
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      reset({
        name: test?.name || '',
        code: test?.code || '',
        category: test?.category || 'BLOOD',
        specimenType: test?.specimenType || '',
        description: test?.description || '',
        manual: test?.manual || '',
        rate: test?.rate ?? 0,
        status: test?.status || 'ACTIVE',
      });
    }
  }, [isOpen, test, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Pathology Test' : 'Add New Pathology Test'}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Test Name"
            placeholder="e.g. Complete Blood Count (CBC)"
            error={errors.name?.message}
            required
            {...register('name')}
          />

          <Input
            label="Test Code"
            placeholder="e.g. CBC-001"
            error={errors.code?.message}
            required
            {...register('code')}
          />

          <Select
            label="Category"
            options={TEST_CATEGORY_OPTIONS}
            error={errors.category?.message}
            required
            {...register('category')}
          />

          <Input
            label="Specimen Type"
            placeholder="e.g. Venous Blood"
            error={errors.specimenType?.message}
            required
            {...register('specimenType')}
          />

          <Select
            label="Status"
            options={[
              { label: 'Active', value: 'ACTIVE' },
              { label: 'Inactive', value: 'INACTIVE' },
            ]}
            error={errors.status?.message}
            required
            {...register('status')}
          />

          <Input
            label="Test Rate"
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            error={errors.rate?.message}
            required
            {...register('rate', { valueAsNumber: true })}
          />
        </div>

        <Textarea
          label="Description"
          placeholder="Brief description of what this test measures..."
          rows={2}
          error={errors.description?.message}
          {...register('description')}
        />

        <Textarea
          label="Collection & Preparation Manual"
          placeholder="Enter step-by-step collection and preparation instructions..."
          rows={6}
          error={errors.manual?.message}
          required
          {...register('manual')}
        />

        <div className="flex justify-end gap-3 pt-2 border-t border-border-subtle">
          <Button type="button" variant="secondary" size="md" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" size="md" disabled={isLoading} isLoading={isLoading}>
            {isEdit ? 'Update Test' : 'Add Test'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
