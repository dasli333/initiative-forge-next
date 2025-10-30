Jesteś specjalistą GitHub Actions w stacku @.ai/tech-stack.md  @package.json

Utwórz scenariusz "push_main.yml" na podstawie @.cursor/rules/github-action.mdc

Workflow:
Scenariusz "push_main.yml" powinien działać następująco:

- Lintowanie kodu
- Następnie dwa równoległe - unit-test i e2e-test

Dodatkowe uwagi:
- w jobie e2e pobieraj przeglądarki wg @playwright.config.ts
- w jobie e2e ustaw środowisko "integration" i zmienne z sekretów wg @.env.example