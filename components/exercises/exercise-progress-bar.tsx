import { Progress } from "@/components/ui/progress"
import { useExerciseExecution } from "@/hooks/use-exercise-execution"

export function ExerciseProgress() {
  const { currentQuestionIndex, totalQuestions } = useExerciseExecution()

  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100

  return (
    <div className="mb-6 flex-shrink-0">
      <Progress value={progress} className="h-4 [&>div]:bg-blue-500 bg-gray-200" />
    </div>
  )
}