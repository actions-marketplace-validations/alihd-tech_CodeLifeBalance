"use client"

import {
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
} from "react"
import {
  Check,
  Code2,
  Copy,
  FolderOutput,
  GitBranch,
  LockKeyhole,
  Palette,
  ShieldCheck,
  Terminal,
  UserRound,
  Workflow,
} from "lucide-react"
import {
  defaultPrivacyConfig,
  generateCliCommand,
  generateWorkflow,
  type PrivacyConfig,
} from "@/lib/privacy-config"

const fieldClass =
  "h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/65 focus:border-primary focus:ring-2 focus:ring-primary/15"

type PreviewMode = "workflow" | "cli"

export function PrivacyConfigurator() {
  const [config, setConfig] = useState<PrivacyConfig>(defaultPrivacyConfig)
  const [previewMode, setPreviewMode] = useState<PreviewMode>("workflow")
  const [copied, setCopied] = useState<PreviewMode | null>(null)

  const workflow = useMemo(() => generateWorkflow(config), [config])
  const cli = useMemo(() => generateCliCommand(config), [config])

  const update = <K extends keyof PrivacyConfig>(key: K, value: PrivacyConfig[K]) => {
    setConfig((current) => ({ ...current, [key]: value }))
  }

  const copy = async (kind: PreviewMode, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      const textarea = document.createElement("textarea")
      textarea.value = value
      textarea.style.position = "fixed"
      textarea.style.opacity = "0"
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      textarea.remove()
    }

    setCopied(kind)
    window.setTimeout(() => setCopied(null), 1600)
  }

  const currentPreview = previewMode === "workflow" ? workflow : cli
  const privateMode = config.includePrivate

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)] xl:grid-cols-[minmax(0,0.82fr)_minmax(520px,1.18fr)]">
      <section className="min-w-0 rounded-2xl border border-border/80 bg-card shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-3.5 sm:px-5">
          <div>
            <h2 className="text-sm font-bold">Report settings</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Changes update the generated setup instantly.
            </p>
          </div>
          <span className="rounded-full border border-border bg-background px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Local only
          </span>
        </div>

        <div className="divide-y divide-border/70">
          <ConfigSection
            icon={UserRound}
            title="GitHub account"
            description="Choose the account to analyze. Timing categories are applied automatically with no timezone or workday setup."
          >
            <div className="max-w-sm">
              <Field label="GitHub username" hint="Blank uses the repository owner.">
                <input
                  value={config.username}
                  onChange={(event) => update("username", event.target.value)}
                  placeholder="octocat"
                  className={fieldClass}
                />
              </Field>
            </div>
          </ConfigSection>

          <ConfigSection
            icon={Palette}
            title="Report appearance"
            description="Keep the generated card aligned with your profile or repository."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <ChoiceGroup
                label="Theme"
                value={config.theme}
                options={[
                  { value: "dark", label: "Dark" },
                  { value: "light", label: "Light" },
                ]}
                onChange={(value) => update("theme", value as PrivacyConfig["theme"])}
              />
              <ChoiceGroup
                label="Layout"
                value={config.cardStyle}
                options={[
                  { value: "detailed", label: "Detailed" },
                  { value: "compact", label: "Compact" },
                ]}
                onChange={(value) =>
                  update("cardStyle", value as PrivacyConfig["cardStyle"])
                }
              />
            </div>
          </ConfigSection>

          <ConfigSection
            icon={FolderOutput}
            title="Files & delivery"
            description="Choose what gets generated and where GitHub should keep it."
          >
            <Field label="Output directory">
              <input
                value={config.outputDir}
                onChange={(event) => update("outputDir", event.target.value)}
                placeholder="code-life-balance"
                className={fieldClass}
              />
            </Field>

            <p className="mt-3 rounded-lg border border-border bg-background px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
              The workflow writes a shareable SVG card and Markdown summary. Your interactive
              dashboard stays available in the app; no JSON file is generated.
            </p>

            <div className="mt-3 grid gap-2">
              <CompactToggle
                checked={config.commit}
                onChange={(value) => update("commit", value)}
                title="Commit generated files"
                description="Otherwise upload the report as a GitHub artifact."
              />
              <CompactToggle
                checked={config.includePrivate}
                onChange={(value) => update("includePrivate", value)}
                title="Include private repositories"
                description="Uses your own CODE_LIFE_TOKEN secret inside GitHub Actions."
                sensitive
              />
            </div>
          </ConfigSection>

        </div>
      </section>

      <aside className="min-w-0 lg:sticky lg:top-[4.5rem] lg:self-start">
        <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
          <div className="border-b border-border/70 p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold">Generated setup</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Ready to paste into GitHub or run locally.
                </p>
              </div>
              <button
                type="button"
                onClick={() => copy(previewMode, currentPreview)}
                className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-xs font-semibold transition hover:border-primary/40 hover:text-primary"
              >
                {copied === previewMode ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied === previewMode ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-background p-1">
              <PreviewTab
                active={previewMode === "workflow"}
                icon={Workflow}
                label="GitHub Actions"
                onClick={() => setPreviewMode("workflow")}
              />
              <PreviewTab
                active={previewMode === "cli"}
                icon={Terminal}
                label="Local CLI"
                onClick={() => setPreviewMode("cli")}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-px border-b border-border/70 bg-border">
            <SummaryItem
              icon={Workflow}
              label="Run mode"
              value="Manual"
            />
            <SummaryItem
              icon={FolderOutput}
              label="Report"
              value="SVG · Markdown"
            />
            <SummaryItem
              icon={ShieldCheck}
              label="Access"
              value={privateMode ? "Private + public" : "Public"}
            />
          </div>

          {privateMode && (
            <div className="border-b border-primary/20 bg-primary/5 px-3 py-2.5 sm:px-4">
              <div className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <span>
                  {previewMode === "workflow" ? (
                    <>
                      Private mode expects a fine-grained GitHub token stored as{" "}
                      <code className="font-semibold text-primary">CODE_LIFE_TOKEN</code>.
                    </>
                  ) : (
                    <>
                      Private CLI mode uses{" "}
                      <code className="font-semibold text-primary">GITHUB_TOKEN</code> or your
                      existing <code className="font-semibold text-primary">gh auth login</code>{" "}
                      session.
                    </>
                  )}
                </span>
              </div>
            </div>
          )}

          <CodePreview
            mode={previewMode}
            value={currentPreview}
          />
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          <TrustNote
            icon={ShieldCheck}
            title="No provider token"
            text="Credentials stay in GitHub Actions or your local shell."
          />
          <TrustNote
            icon={GitBranch}
            title="You own outputs"
            text="Reports stay in your repo or GitHub artifacts."
          />
          <TrustNote
            icon={Code2}
            title="Portable setup"
            text="Generated config is plain YAML and a directly runnable CLI command."
          />
        </div>
      </aside>
    </div>
  )
}

function ConfigSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="p-4 sm:p-5">
      <div className="mb-3 flex items-start gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/8 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-sm font-bold">{title}</h3>
          <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      {children}
    </div>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold">{label}</span>
      {children}
      {hint && (
        <span className="mt-1 block text-[10px] leading-relaxed text-muted-foreground">
          {hint}
        </span>
      )}
    </label>
  )
}

function ChoiceGroup({
  label,
  value,
  options,
  onChange,
  wrap = false,
}: {
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (value: string) => void
  wrap?: boolean
}) {
  return (
    <div>
      <span className="mb-1.5 block text-xs font-semibold">{label}</span>
      <div
        className={
          "flex gap-1 rounded-lg border border-border bg-background p-1 " +
          (wrap ? "flex-wrap" : "")
        }
      >
        {options.map((option) => {
          const active = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.value)}
              className={
                "min-w-0 flex-1 rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition " +
                (active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground")
              }
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function CompactToggle({
  checked,
  onChange,
  title,
  description,
  sensitive = false,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  title: string
  description: string
  sensitive?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={
        "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition " +
        (checked
          ? "border-primary/45 bg-primary/7"
          : "border-border bg-background hover:border-primary/25")
      }
    >
      <span
        className={
          "flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition " +
          (checked ? "bg-primary" : "bg-muted-foreground/30")
        }
      >
        <span
          className={
            "h-4 w-4 rounded-full bg-white shadow-sm transition-transform " +
            (checked ? "translate-x-4" : "translate-x-0")
          }
        />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-xs font-semibold">
          {title}
          {sensitive && <LockKeyhole className="h-3 w-3 text-primary" />}
        </span>
        <span className="mt-0.5 block text-[10px] leading-relaxed text-muted-foreground">
          {description}
        </span>
      </span>
    </button>
  )
}

function PreviewTab({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean
  icon: ComponentType<{ className?: string }>
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={
        "flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition " +
        (active
          ? "bg-card text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground")
      }
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  )
}

function SummaryItem({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="min-w-0 bg-card px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <p className="mt-1 truncate text-xs font-bold">{value}</p>
    </div>
  )
}

function CodePreview({
  mode,
  value,
}: {
  mode: PreviewMode
  value: string
}) {
  return (
    <div className="bg-[oklch(0.075_0.012_155)]">
      <div className="flex items-center justify-between border-b border-white/8 px-4 py-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/45">
          {mode === "workflow"
            ? ".github/workflows/code-life-balance.yml"
            : "terminal"}
        </span>
        <span className="font-mono text-[10px] text-emerald-300/70">
          {mode === "workflow" ? "YAML" : "Shell"}
        </span>
      </div>
      <pre
        className={
          "overflow-auto p-4 font-mono text-[11px] leading-5 text-[oklch(0.88_0.02_150)] sm:p-5 " +
          (mode === "workflow"
            ? "max-h-[540px] lg:h-[min(57vh,540px)]"
            : "max-h-[240px] whitespace-pre-wrap break-words")
        }
      >
        <code>{value}</code>
      </pre>
    </div>
  )
}

function TrustNote({
  icon: Icon,
  title,
  text,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  text: string
}) {
  return (
    <div className="rounded-xl border border-border/80 bg-card px-3 py-3">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-primary" />
        <h3 className="text-[11px] font-bold">{title}</h3>
      </div>
      <p className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground">{text}</p>
    </div>
  )
}
