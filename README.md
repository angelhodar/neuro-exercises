# NeuroGranada

[neurogranada.com](https://neurogranada.com) · Interactive cognitive rehabilitation exercises created and refined through natural-language chat.

NeuroGranada helps non-technical rehabilitation professionals turn an idea into an exercise, preview it alongside the conversation, and adapt it for a rehabilitation session. A shared media library supplies reusable images, audio, and video.

## What the project offers

- AI-assisted requirements discovery and iterative exercise creation.
- Exercise previews, configuration forms, and reusable presets.
- A media library with uploads, image creation, and search.
- Patient records, session notes, templates, results, and speech tools.
- Administrator-managed accounts and organizations.

The primary focus is professional-led rehabilitation. Share links already exist, but independent patient use is not the main release goal. Automated browser review and deliberate sharing between organizations are future directions.

## Get started

Follow [local development](docs/local-development.md) to install dependencies, start a development database, and provision your first administrator. External AI and media services are only needed for the features that use them.

**Safety note:** the build command applies database migrations. Always verify the configured database before building or running maintenance commands.

## Documentation

The [documentation index](docs/README.md) explains the product, its main workflows, setup, and operational considerations. Documentation emphasizes stable concepts; consult the source and `package.json` for exact implementation details and dependency versions.

Contributor and coding-assistant instructions live in [AGENTS.md](AGENTS.md).
