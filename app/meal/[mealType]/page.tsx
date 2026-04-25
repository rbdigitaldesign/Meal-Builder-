import MealBuilderClient from "./MealBuilderClient";

export function generateStaticParams() {
  return [
    { mealType: "breakfast" },
    { mealType: "lunch" },
    { mealType: "dinner" },
    { mealType: "snack" },
  ];
}

interface PageProps {
  params: Promise<{ mealType: string }>;
}

export default function MealBuilderPage({ params }: PageProps) {
  return <MealBuilderClient params={params} />;
}
