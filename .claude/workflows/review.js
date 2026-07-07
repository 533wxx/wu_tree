export const meta = {
  name: 'review',
  description: '多维度审查代码变更并确认修复',
  phases: [
    { title: '审查', detail: '并行审查' },
    { title: '验证', detail: '确认发现' }
  ]
}

const DIMENSIONS = [
  {
    key: 'bugs',
    prompt: '审查代码的正确性：逻辑错误、边界条件、空值处理。返回 {findings: [{file, line, summary, severity, suggestion}]}'
  },
  {
    key: 'security',
    prompt: '审查代码的安全性：XSS、注入、敏感数据泄露。返回 {findings: [{file, line, summary, severity, suggestion}]}'
  }
]

phase('审查')
const reviewed = await pipeline(
  DIMENSIONS,
  d => agent(d.prompt, {
    label: `审查:${d.key}`,
    phase: '审查',
    schema: {
      type: 'object',
      properties: {
        findings: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              file: { type: 'string' },
              line: { type: 'number' },
              summary: { type: 'string' },
              severity: { type: 'string', enum: ['high', 'medium', 'low'] },
              suggestion: { type: 'string' }
            },
            required: ['file', 'line', 'summary', 'severity', 'suggestion']
          }
        }
      },
      required: ['findings']
    }
  })
)

const allFindings = reviewed.filter(Boolean).flatMap(r => r.findings || [])
log(`发现 ${allFindings.length} 个问题`)

if (allFindings.length > 0) {
  phase('验证')
  const verified = await parallel(
    allFindings.map(f => () =>
      agent(`验证是否为真实问题：${f.file}:${f.line} — ${f.summary}`, {
        label: `验证:${f.file}`,
        phase: '验证',
        schema: {
          type: 'object',
          properties: { real: { type: 'boolean' }, reason: { type: 'string' } },
          required: ['real', 'reason']
        }
      })
    )
  )
  const confirmed = allFindings.filter((_, i) => verified[i]?.real)
  log(`确认 ${confirmed.length} 个真实问题`)
  return { findings: allFindings, confirmed }
}

log('✅ 未发现问题')
return { findings: [], confirmed: [] }
