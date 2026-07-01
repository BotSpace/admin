import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AdminAPI, type TemplateCategory } from "@/shared/api/services";
import { TemplateCreateForm } from "@/features/templates/template-create-form";

export default async function NewTemplatePage() {
  let categories: TemplateCategory[] = [];
  try {
    categories = await AdminAPI.templateCategories();
  } catch {
    // degraded gracefully
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/templates"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Shablonlar
        </Link>
        <h1 className="text-2xl font-bold">Yangi shablon</h1>
        <p className="text-muted-foreground text-sm">
          Loyihani tanlang va asosiy ma&apos;lumotlarni kiriting — tarkib avtomatik yig&apos;iladi
        </p>
      </div>

      <TemplateCreateForm categories={categories} />
    </div>
  );
}
