import { getTodos } from "@/lib/data";
import { TodosContent } from "@/components/TodosContent";

export default async function TodosPage() {
  const todos = await getTodos();
  return <TodosContent todos={todos} />;
}
