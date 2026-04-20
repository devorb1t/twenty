import { sanitizeToolSchemaForXaiWorkflow } from './sanitize-tool-schema-for-xai-workflow.util';

describe('sanitizeToolSchemaForXaiWorkflow', () => {
  it('removes recursive logical filter keys and unused defs', () => {
    const schema = {
      type: 'object',
      properties: {
        limit: { type: 'number' },
        name: { type: 'string' },
        or: { type: 'array', items: { $ref: '#/$defs/__schema0' } },
        and: { type: 'array', items: { $ref: '#/$defs/__schema0' } },
        not: { $ref: '#/$defs/__schema0' },
      },
      additionalProperties: false,
      $defs: {
        __schema0: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            or: { type: 'array', items: { $ref: '#/$defs/__schema0' } },
            and: { type: 'array', items: { $ref: '#/$defs/__schema0' } },
            not: { $ref: '#/$defs/__schema0' },
          },
        },
      },
    };

    expect(sanitizeToolSchemaForXaiWorkflow(schema)).toEqual({
      type: 'object',
      properties: {
        limit: { type: 'number' },
        name: { type: 'string' },
      },
      additionalProperties: false,
    });
  });
});
