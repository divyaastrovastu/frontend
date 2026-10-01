'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { apiDelete, apiGet, apiPatch, apiPost } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import type { FAQ } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

type FaqForm = { question: string; answer: string; category: string; isActive: boolean };

export default function AdminFaqsPage() {
  const toast = useToast();
  const [items, setItems] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FAQ | null>(null);
  const form = useForm<FaqForm>({
    defaultValues: { question: '', answer: '', category: '', isActive: true },
  });

  async function load() {
    try {
      setLoading(true);
      const data = await apiGet<FAQ[] | { items: FAQ[] }>('/admin/faqs');
      setItems(Array.isArray(data) ? data : data.items || []);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function openCreate() {
    setEditing(null);
    form.reset({ question: '', answer: '', category: '', isActive: true });
    setOpen(true);
  }

  function openEdit(f: FAQ) {
    setEditing(f);
    form.reset({
      question: f.question,
      answer: f.answer,
      category: f.category || '',
      isActive: f.isActive,
    });
    setOpen(true);
  }

  async function onSubmit(values: FaqForm) {
    try {
      if (editing) {
        await apiPatch(`/admin/faqs/${editing.id}`, values);
        toast.success('FAQ updated');
      } else {
        await apiPost('/admin/faqs', values);
        toast.success('FAQ added');
      }
      setOpen(false);
      setEditing(null);
      form.reset();
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState onRetry={() => void load()} />;

  return (
    <>
      <Card>
        <CardHeader
          title="FAQs"
          action={
            <Button variant="gold" size="sm" onClick={openCreate}>
              Add FAQ
            </Button>
          }
        />
        {items.length === 0 ? (
          <EmptyState title="No FAQs" />
        ) : (
          <ul className="divide-y divide-border">
            {items.map((f) => (
              <li key={f.id} className="flex justify-between gap-3 py-3">
                <div>
                  <p className="font-medium text-navy">{f.question}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{f.answer}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(f)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      void apiDelete(`/admin/faqs/${f.id}`)
                        .then(load)
                        .catch((e) => toast.error(getErrorMessage(e)))
                    }
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Edit FAQ' : 'Add FAQ'}
      >
        <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
          <Input label="Question" {...form.register('question', { required: true })} />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-navy">Answer</label>
            <textarea
              className="min-h-28 w-full rounded-md border border-border px-3 py-2 text-sm"
              {...form.register('answer', { required: true })}
            />
          </div>
          <Input label="Category" {...form.register('category')} />
          <label className="flex items-center gap-2 text-sm text-navy">
            <input type="checkbox" {...form.register('isActive')} /> Active
          </label>
          <Button type="submit" variant="gold" className="w-full">
            {editing ? 'Save changes' : 'Save'}
          </Button>
        </form>
      </Modal>
    </>
  );
}
