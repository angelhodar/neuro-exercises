# Exercises

An exercise has three main responsibilities: define its configuration and validation, provide an interactive activity, and present results. Existing exercises share lifecycle and UI conventions so they can be used consistently.

## Creation and refinement

The author describes an idea, clarifies requirements, and approves a brief. An implementation agent builds the exercise, then the author tries it in a preview and requests improvements through conversation.

Saved checkpoints preserve completed versions. A generated preview does not automatically become a deployed catalog exercise; publication and approval need a separate workflow.

## Configuration and execution

Configuration forms let professionals adjust behavior without changing the exercise itself. Depending on the activity, this may include stimuli, difficulty, duration, question count, or how the activity advances.

Execution follows shared start, progress, completion, and results conventions. An exercise should integrate with that lifecycle rather than inventing its own incompatible behavior. For exact implementation contracts, consult a comparable existing exercise.

## Reuse

- **Presets** save useful configurations for one exercise.
- **Templates** combine several exercises with predefined configurations and ordering.
- **Share links** provide another way to access an assigned template, but are ahead of the project's current professional-led release focus.

Cross-organization sharing is a future direction, not an established permissions model.

## Results and review

Results presentation and persistence depend on the execution workflow. Exercise results are not automatically a unified part of a patient's clinical session record. Some ad-hoc flows place configuration/results in URLs; do not include sensitive patient information there.

Automated code checks do not prove that an exercise works correctly in the browser or is suitable for rehabilitation. Professionals still need to review its behavior and appropriateness.
