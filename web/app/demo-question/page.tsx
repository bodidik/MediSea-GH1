import QuestionView from "@/components/QuestionView";

async function fetchQuestion() {
  const res = await fetch(
    process.env.NEXT_PUBLIC_BACKEND_URL +
      "/api/questions?examType=ydus&limit=1&dev=1",
    { cache: "no-store" }
  );
  const data = await res.json();
  if (!data?.ok || !data.items?.length) return null;

  const q = data.items[0];

  // QuestionView, answer/explanation bekliyor → backend correct/explain döndürüyor.
  return {
    ...q,
    answer: q.correct,
    explanation: q.explain,
  };
}

export default async function DemoQuestionPage() {
  const question = await fetchQuestion();

  if (!question) {
    return (
      <div className="p-6 text-red-600">
        Deneme sorusu bulunamadı (DB boş olabilir).
      </div>
    );
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Demo Question</h1>
      <QuestionView question={question} />
    </main>
  );
}



