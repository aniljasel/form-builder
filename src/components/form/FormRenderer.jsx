import React, { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'

/**
 * FormRenderer (enhanced)
 * - file uploads -> POST /api/uploads (multipart/form-data) -> expects { url, filename } per file
 * - conditional logic -> field.conditional = { op: 'equals'|'not_equals'|'in'|'contains', fieldId, value }
 * - improved UI for radios/checkboxes/select/date
 *
 * NOTE: API_BASE should point to your backend (VITE_API_BASE or default localhost)
 */
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

export default function FormRenderer({ form, onSubmit: externalOnSubmit, submitting: externalSubmitting }) {
  const { control, register, handleSubmit, formState: { errors }, reset, watch, setValue, getValues } = useForm()
  const [localSubmitting, setLocalSubmitting] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  // watch all fields so conditional logic updates reactively
  const watchAll = watch()

  // Evaluate a single conditional object
  // Supported ops: equals, not_equals, in (value present in array), contains (string contains)
  function evalConditional(cond) {
    if (!cond || !cond.fieldId) return true
    const left = watchAll[cond.fieldId]
    const op = cond.op || 'equals'
    const right = cond.value
    if (op === 'equals') return left === right
    if (op === 'not_equals') return left !== right
    if (op === 'in') return Array.isArray(right) ? right.includes(left) : false
    if (op === 'contains') {
      if (!left) return false
      return String(left).toLowerCase().includes(String(right).toLowerCase())
    }
    // default allow
    return true
  }

  // Build validation rules from field.validation metadata
  function buildRules(field) {
    const rules = {}
    if (field.required) rules.required = field.required === true ? `${field.label || 'This field'} is required` : field.required
    const v = field.validation || {}
    if (v.minLength) rules.minLength = { value: v.minLength, message: `Minimum ${v.minLength} characters` }
    if (v.maxLength) rules.maxLength = { value: v.maxLength, message: `Maximum ${v.maxLength} characters` }
    if (v.min !== undefined) rules.min = { value: v.min, message: `Minimum ${v.min}` }
    if (v.max !== undefined) rules.max = { value: v.max, message: `Maximum ${v.max}` }
    if (v.pattern) {
      try {
        const re = new RegExp(v.pattern)
        rules.pattern = { value: re, message: v.patternMessage || 'Invalid format' }
      } catch (e) {
        // ignore bad regex
      }
    }
    return rules
  }

  // Upload a single File object to backend; returns { ok, url, filename, error }
  async function uploadFile(file) {
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch(`${API_BASE}/api/uploads`, {
        method: 'POST',
        body: fd
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        return { ok: false, error: body?.error || `Upload failed (${res.status})` }
      }
      const j = await res.json()
      return { ok: true, ...j } // expect { url, filename }
    } catch (err) {
      return { ok: false, error: err.message || 'Upload network error' }
    }
  }

  // Handle before actual submission: upload files (if any) and replace File objects in values with URLs
  async function prepareValuesForSubmit(values) {
    // Detect file fields in form schema (type === 'file') and if values[fieldId] contains File objects
    if (!form) return values
    const newValues = { ...values }
    const fileFields = form.fields.filter(f => f.type === 'file')
    if (fileFields.length === 0) return newValues

    setUploadingFiles(true)
    try {
      for (const f of fileFields) {
        const fid = f.id
        const val = values[fid]
        if (!val) { newValues[fid] = null; continue }
        // val can be File or array of Files (if multiple)
        if (Array.isArray(val)) {
          const urls = []
          for (const file of val) {
            if (file instanceof File) {
              const up = await uploadFile(file)
              if (up.ok) urls.push({ url: up.url, filename: up.filename })
              else throw new Error(up.error || 'File upload failed')
            } else if (typeof file === 'string') {
              urls.push({ url: file, filename: file })
            }
          }
          newValues[fid] = urls
        } else {
          // single file
          if (val instanceof File) {
            const up = await uploadFile(val)
            if (!up.ok) throw new Error(up.error || 'File upload failed')
            newValues[fid] = { url: up.url, filename: up.filename }
          } else {
            newValues[fid] = val // maybe already url
          }
        }
      }
      return newValues
    } finally {
      setUploadingFiles(false)
    }
  }

  // internal submit: posts to /api/responses/:formId
  async function internalSubmit(values) {
    if (!form || !form._id) return { ok: false, error: 'Form missing id' }
    // upload files first and get URLs
    const prepared = await prepareValuesForSubmit(values)
    try {
      const res = await fetch(`${API_BASE}/api/responses/${form._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: prepared })
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) return { ok: false, error: j?.error || `Submission failed (${res.status})` }
      return { ok: true, data: j }
    } catch (err) {
      return { ok: false, error: err.message || 'Submission error' }
    }
  }

  async function handleLocalSubmit(data) {
    setErrorMsg(null)
    setSuccessMsg(null)
    const submiter = externalOnSubmit ? externalOnSubmit : internalSubmit
    try {
      if (!externalSubmitting) setLocalSubmitting(true)
      const result = await submiter(data)
      if (result?.ok) {
        setSuccessMsg('Thanks — your response has been submitted.')
        reset()
      } else {
        setErrorMsg(result?.error || 'Submission failed')
      }
      return result
    } catch (err) {
      setErrorMsg(err.message || 'Submission failed')
      return { ok: false, error: err.message }
    } finally {
      if (!externalSubmitting) setLocalSubmitting(false)
    }
  }

  // UI helper renderers
  function RadioGroup({ field, rules }) {
    return (
      <div role="radiogroup" aria-labelledby={`${field.id}-label`} className="ui-radiogroup">
        {(field.options || []).map(opt => (
          <label key={opt} className="ui-radio">
            <input {...register(field.id, rules)} type="radio" value={opt} />
            <span className="ui-radio-label">{opt}</span>
          </label>
        ))}
      </div>
    )
  }

  function CheckboxGroup({ field, rules }) {
    // support multi-option checkbox group -> store array
    return (
      <Controller
        control={controlForController()}
        name={field.id}
        rules={rules}
        defaultValue={[]}
        render={({ field: ctl }) => {
          const value = Array.isArray(ctl.value) ? ctl.value : []
          return (
            <div className="ui-checkbox-group">
              {(field.options || []).map(opt => {
                const checked = value.includes(opt)
                return (
                  <label key={opt} className="ui-checkbox">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        const next = checked ? value.filter(v => v !== opt) : [...value, opt]
                        ctl.onChange(next)
                      }}
                    />
                    <span className="ui-checkbox-label">{opt}</span>
                  </label>
                )
              })}
            </div>
          )
        }}
      />
    )
  }

  // small helper: Controller needs control object; if not available, fallback to control variable.
  function controlForController() {
    // React-hook-form's `control` exists; return it.
    return control
  }

  // render field (with conditional logic check)
  function renderField(f) {
    // conditional check
    if (f.conditional && !evalConditional(f.conditional)) return null

    const rules = buildRules(f)

    if (['text', 'email', 'number'].includes(f.type)) {
      return (
        <input
          {...register(f.id, rules)}
          type={f.type === 'number' ? 'number' : (f.type === 'email' ? 'email' : 'text')}
          placeholder={f.placeholder || ''}
          className="input"
        />
      )
    }

    if (f.type === 'date') {
      // improved date UI: use native date input
      return (
        <input
          {...register(f.id, rules)}
          type="date"
          className="input"
        />
      )
    }

    if (f.type === 'textarea') {
      return <textarea {...register(f.id, rules)} placeholder={f.placeholder || ''} className="textarea" />
    }

    if (f.type === 'select') {
      return (
        <select {...register(f.id, rules)} className="select">
          <option value="">-- select --</option>
          {(f.options || []).map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      )
    }

    if (f.type === 'radio') return <RadioGroup field={f} rules={rules} />

    if (f.type === 'checkbox') {
      if (!f.options || f.options.length === 0) {
        // single boolean checkbox
        return <input {...register(f.id, rules)} type="checkbox" />
      }
      return <CheckboxGroup field={f} rules={rules} />
    }

    if (f.type === 'file') {
      // allow single or multiple depending on f.multiple flag
      const multiple = !!f.multiple
      return (
        <Controller
          control={controlForController()}
          name={f.id}
          defaultValue={multiple ? [] : null}
          render={({ field: ctl }) => {
            // local preview state not persisted between reloads
            const value = ctl.value
            return (
              <div className="file-field">
                <input
                  type="file"
                  multiple={multiple}
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || [])
                    // store File objects (they will be uploaded before final submit)
                    if (multiple) ctl.onChange(files)
                    else ctl.onChange(files[0] || null)
                  }}
                />
                {/* preview */}
                <div className="file-previews" style={{ marginTop: 8 }}>
                  {multiple ? (value || []).map((fobj, idx) => (
                    <PreviewFile key={idx} file={fobj} />
                  )) : (value ? <PreviewFile file={value} /> : null)}
                </div>
              </div>
            )
          }}
        />
      )
    }

    // fallback
    return <input {...register(f.id, rules)} placeholder={f.placeholder || ''} className="input" />
  }

  // preview helper for local File object or previously uploaded {url}
  function PreviewFile({ file }) {
    if (!file) return null
    // if file is a File object
    if (file instanceof File) {
      const isImage = file.type && file.type.startsWith('image/')
      return (
        <div className="file-preview-item">
          {isImage ? <img src={URL.createObjectURL(file)} alt={file.name} style={{ maxHeight: 80 }} /> : <div className="file-icon">{file.name}</div>}
          <div className="file-meta">{file.name} • {(file.size/1024|0)} KB</div>
        </div>
      )
    }
    // if file is an uploaded object { url, filename }
    if (file.url) {
      const isImage = /\.(jpe?g|png|gif|webp)$/i.test(file.filename || file.url)
      return (
        <div className="file-preview-item">
          {isImage ? <img src={file.url} alt={file.filename} style={{ maxHeight: 80 }} /> : <a href={file.url} target="_blank" rel="noreferrer">{file.filename || file.url}</a>}
        </div>
      )
    }
    // if it's string url
    if (typeof file === 'string') {
      return <a href={file} target="_blank" rel="noreferrer">{file}</a>
    }
    return null
  }

  return (
    <form onSubmit={handleSubmit(handleLocalSubmit)} className="form-renderer glass" noValidate>
      <div className="form-header">
        <h2 className="form-title">{form?.title}</h2>
        {form?.description && <p className="form-desc">{form.description}</p>}
      </div>

      <div className="form-fields">
        {(form?.fields || []).map(f => (
          <div key={f.id} className="form-field">
            <label className="field-label" id={`${f.id}-label`}>{f.label}{f.required ? ' *' : ''}</label>
            <div className="field-control">
              {renderField(f)}
            </div>
            {errors[f.id] && <div className="form-error">{errors[f.id].message || 'This field is required'}</div>}
          </div>
        ))}
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={externalSubmitting || localSubmitting || uploadingFiles}
          aria-busy={externalSubmitting || localSubmitting || uploadingFiles}
        >
          { (externalSubmitting || localSubmitting || uploadingFiles) ? 'Submitting…' : (form?.settings?.submitText || 'Submit') }
        </button>
      </div>

      {uploadingFiles && <div className="small" style={{ marginTop: 8 }}>Uploading files…</div>}
      {successMsg && <div className="small" style={{ marginTop: 8, color: '#9fe599' }}>{successMsg}</div>}
      {errorMsg && <div className="small" style={{ marginTop: 8, color: '#ff9aa2' }}>{errorMsg}</div>}
    </form>
  )
}
