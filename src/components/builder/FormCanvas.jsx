import React from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

export default function FormCanvas({ fields, setFields, onSelect, onRemove }) {
  function onDragEnd(result) {
    if (!result.destination) return
    const items = Array.from(fields)
    const [reordered] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reordered)
    setFields(items)
  }

  return (
    <section className="form-canvas glass">
      <h4 className="section-title">Form Overview</h4>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="form-canvas">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="canvas-list"
            >
              {fields.length === 0 && (
                <div className="canvas-empty">Drag fields here or click a field in toolbox to add.</div>
              )}

              {fields.map((f, idx) => (
                <Draggable key={f.id} draggableId={f.id} index={idx}>
                  {(p) => (
                    <div
                      ref={p.innerRef}
                      {...p.draggableProps}
                      {...p.dragHandleProps}
                      className="field-card"
                    >
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1 }}>
                        <div style={{ minWidth: 8, paddingLeft: 4 }} aria-hidden>☰</div>
                        <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => onSelect(f)}>
                          <div className="field-label">{f.label || `[${f.type}]`}</div>
                          <div className="field-meta">{f.placeholder || f.fieldName || ''}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button
                          title="Edit"
                          onClick={() => onSelect(f)}
                          className="btn"
                          style={{ padding: '6px 8px' }}
                        >✎</button>

                        <button
                          title="Remove field"
                          onClick={() => onRemove(f.id)}
                          className="btn"
                          style={{ padding: '6px 8px', background: 'linear-gradient(180deg, rgba(255,0,0,0.06), rgba(255,0,0,0.02))', borderColor: 'rgba(255,0,0,0.12)' }}
                        >🗑</button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </section>
  )
}
