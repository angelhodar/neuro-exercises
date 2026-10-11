# Project idea and scope

## Purpose

Let non-technical rehabilitation professionals create interactive cognitive exercises using natural language rather than writing software. The intended primary setting is a rehabilitation session led by a professional, not an autonomous diagnostic or treatment system.

The author describes an idea to a chatbot, clarifies requirements, and iterates on the implementation with a preview beside the conversation. Each exercise exposes a configuration form so the professional can adjust execution behavior. A reusable media library lets them customize stimuli without rewriting the exercise.

The interface and many AI-facing prompts are Spanish; developer documentation is English.

## Implemented workflow

1. Describe an exercise on `/dashboard/exercises/create`.
2. The requirements agent asks questions or proposes a structured brief. Submitted conversations are saved as private drafts.
3. The author approves the brief; creation generates metadata, optionally a thumbnail/audio instructions, and the initial generation record.
4. The implementation agent writes the exercise in a persistent Sandbox workspace.
5. A completed, validated ZIP checkpoint supplies a separate preview. Further chat messages iterate on the exercise.
6. Checked-in/catalog exercise modules provide configuration, execution, and results screens. Presets and templates reuse configurations.

Other implemented areas include media management, patients/sessions/tests, organizations, user administration, speech tools, and share links. Their presence does not imply a complete clinical review process or organization-isolated marketplace.

## Intended direction — not yet implemented

- **Browser reviewer agent:** a third exercise agent using `agent-browser` to run the exercise, exercise its controls, and report functional failures alongside human review. Current type/lint checks do not substitute for this.
- **Shared rehabilitation catalog:** organizations can deliberately share and execute exercises. Existing global reads are not a designed sharing/permissions model.
- **Shared rehabilitation templates:** reusable sets of exercises with predefined configuration and ordering, extending today's template foundations.
- **Human review:** the owner envisions an automated reviewer alongside the human. Who signs off, what clinical criteria apply, and how approval is enforced remain to be designed.

Share links already exist, but the owner considers them premature for the current release focus. They are not removed or disabled by this documentation work. Independent patient use should not be presented as the primary intended workflow.

## Non-guarantees

Generated exercises are not automatically clinically validated. The repository does not establish medical-device compliance, patient-data compliance, media licensing, retention rules, or safe unsupervised rehabilitation. See [known gaps](known-gaps.md) before using real patient information or expanding access.
