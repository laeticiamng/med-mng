/**
 * OpenAPI Schema Generator and Validator
 * Generates TypeScript types from OpenAPI specifications
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';

interface OpenAPISpec {
  openapi: string;
  info: any;
  servers: any[];
  paths: Record<string, any>;
  components: {
    schemas: Record<string, any>;
    responses: Record<string, any>;
    securitySchemes: Record<string, any>;
  };
}

interface GeneratedTypes {
  interfaces: string[];
  enums: string[];
  validationSchemas: string[];
}

export class OpenAPITypeGenerator {
  private spec: OpenAPISpec;

  constructor(specPath: string) {
    const specContent = readFileSync(specPath, 'utf8');
    this.spec = yaml.load(specContent) as OpenAPISpec;
  }

  generateTypes(): GeneratedTypes {
    const interfaces: string[] = [];
    const enums: string[] = [];
    const validationSchemas: string[] = [];

    // Generate interfaces from schemas
    for (const [schemaName, schema] of Object.entries(this.spec.components.schemas)) {
      const interfaceCode = this.generateInterface(schemaName, schema);
      interfaces.push(interfaceCode);

      const validationCode = this.generateValidationSchema(schemaName, schema);
      validationSchemas.push(validationCode);
    }

    // Generate enums from schema enums
    this.extractEnums().forEach(enumDef => {
      enums.push(enumDef);
    });

    return { interfaces, enums, validationSchemas };
  }

  private generateInterface(name: string, schema: any): string {
    const properties = schema.properties || {};
    const required = schema.required || [];

    let interfaceCode = `/**\n * Generated from OpenAPI schema: ${name}\n */\n`;
    interfaceCode += `export interface ${this.toPascalCase(name)} {\n`;

    for (const [propName, propSchema] of Object.entries(properties)) {
      const isRequired = required.includes(propName);
      const propType = this.getTypeScriptType(propSchema as any);
      const optional = isRequired ? '' : '?';
      
      // Add JSDoc comment if description exists
      if ((propSchema as any).description) {
        interfaceCode += `  /** ${(propSchema as any).description} */\n`;
      }
      
      interfaceCode += `  ${propName}${optional}: ${propType};\n`;
    }

    interfaceCode += '}\n\n';
    return interfaceCode;
  }

  private generateValidationSchema(name: string, schema: any): string {
    const properties = schema.properties || {};
    const required = schema.required || [];

    let validationCode = `/**\n * Zod validation schema for ${name}\n */\n`;
    validationCode += `import { z } from 'zod';\n\n`;
    validationCode += `export const ${this.toCamelCase(name)}Schema = z.object({\n`;

    for (const [propName, propSchema] of Object.entries(properties)) {
      const isRequired = required.includes(propName);
      const zodType = this.getZodType(propSchema as any);
      const optional = isRequired ? '' : '.optional()';
      
      validationCode += `  ${propName}: ${zodType}${optional},\n`;
    }

    validationCode += '});\n\n';
    validationCode += `export type ${this.toPascalCase(name)} = z.infer<typeof ${this.toCamelCase(name)}Schema>;\n\n`;
    
    return validationCode;
  }

  private getTypeScriptType(schema: any): string {
    if (schema.type === 'string') {
      if (schema.enum) {
        return schema.enum.map((val: string) => `'${val}'`).join(' | ');
      }
      if (schema.format === 'date-time') return 'string'; // or Date if you prefer
      if (schema.format === 'uuid') return 'string';
      if (schema.format === 'email') return 'string';
      if (schema.format === 'uri') return 'string';
      return 'string';
    }
    
    if (schema.type === 'number' || schema.type === 'integer') {
      return 'number';
    }
    
    if (schema.type === 'boolean') {
      return 'boolean';
    }
    
    if (schema.type === 'array') {
      const itemType = this.getTypeScriptType(schema.items);
      return `${itemType}[]`;
    }
    
    if (schema.type === 'object') {
      if (schema.additionalProperties) {
        const valueType = this.getTypeScriptType(schema.additionalProperties);
        return `Record<string, ${valueType}>`;
      }
      return 'object';
    }
    
    if (schema.$ref) {
      const refName = schema.$ref.split('/').pop();
      return this.toPascalCase(refName);
    }
    
    if (schema.oneOf) {
      return schema.oneOf.map((s: any) => this.getTypeScriptType(s)).join(' | ');
    }
    
    return 'unknown';
  }

  private getZodType(schema: any): string {
    if (schema.type === 'string') {
      let zodType = 'z.string()';
      
      if (schema.enum) {
        const enumValues = schema.enum.map((val: string) => `'${val}'`).join(', ');
        return `z.enum([${enumValues}])`;
      }
      
      if (schema.format === 'email') zodType += '.email()';
      if (schema.format === 'uuid') zodType += '.uuid()';
      if (schema.format === 'uri') zodType += '.url()';
      if (schema.minLength) zodType += `.min(${schema.minLength})`;
      if (schema.maxLength) zodType += `.max(${schema.maxLength})`;
      if (schema.pattern) zodType += `.regex(/${schema.pattern}/)`;
      
      return zodType;
    }
    
    if (schema.type === 'number' || schema.type === 'integer') {
      let zodType = schema.type === 'integer' ? 'z.number().int()' : 'z.number()';
      if (schema.minimum !== undefined) zodType += `.min(${schema.minimum})`;
      if (schema.maximum !== undefined) zodType += `.max(${schema.maximum})`;
      return zodType;
    }
    
    if (schema.type === 'boolean') {
      return 'z.boolean()';
    }
    
    if (schema.type === 'array') {
      const itemType = this.getZodType(schema.items);
      return `z.array(${itemType})`;
    }
    
    if (schema.type === 'object') {
      if (schema.additionalProperties) {
        const valueType = this.getZodType(schema.additionalProperties);
        return `z.record(z.string(), ${valueType})`;
      }
      return 'z.object({})';
    }
    
    if (schema.$ref) {
      const refName = schema.$ref.split('/').pop();
      return `${this.toCamelCase(refName)}Schema`;
    }
    
    return 'z.unknown()';
  }

  private extractEnums(): string[] {
    const enums: string[] = [];
    
    for (const [schemaName, schema] of Object.entries(this.spec.components.schemas)) {
      if (schema.type === 'string' && schema.enum) {
        const enumName = `${this.toPascalCase(schemaName)}Enum`;
        let enumCode = `export enum ${enumName} {\n`;
        
        schema.enum.forEach((value: string) => {
          const enumKey = value.toUpperCase().replace(/[^A-Z0-9]/g, '_');
          enumCode += `  ${enumKey} = '${value}',\n`;
        });
        
        enumCode += '}\n\n';
        enums.push(enumCode);
      }
    }
    
    return enums;
  }

  private toPascalCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  private toCamelCase(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1).replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  generateEndpointTypes(): string {
    let endpointTypes = '/**\n * Generated API endpoint types\n */\n\n';
    
    for (const [path, methods] of Object.entries(this.spec.paths)) {
      for (const [method, operation] of Object.entries(methods)) {
        if (typeof operation !== 'object' || !operation.operationId) continue;
        
        const operationId = this.toPascalCase(operation.operationId);
        
        // Request type
        if (operation.requestBody) {
          const requestSchema = operation.requestBody.content?.['application/json']?.schema;
          if (requestSchema) {
            const requestType = this.getTypeScriptType(requestSchema);
            endpointTypes += `export type ${operationId}Request = ${requestType};\n`;
          }
        }
        
        // Response type
        const successResponse = operation.responses?.['200'] || operation.responses?.['201'];
        if (successResponse?.content?.['application/json']?.schema) {
          const responseType = this.getTypeScriptType(successResponse.content['application/json'].schema);
          endpointTypes += `export type ${operationId}Response = ${responseType};\n`;
        }
        
        endpointTypes += '\n';
      }
    }
    
    return endpointTypes;
  }

  writeGeneratedFiles(outputDir: string): void {
    const types = this.generateTypes();
    const endpointTypes = this.generateEndpointTypes();
    
    // Write main types file
    const typesContent = [
      '/**',
      ' * Auto-generated TypeScript types from OpenAPI specification',
      ' * DO NOT EDIT MANUALLY - This file is regenerated automatically',
      ' */',
      '',
      ...types.enums,
      ...types.interfaces,
      endpointTypes
    ].join('\n');
    
    writeFileSync(join(outputDir, 'api-types.ts'), typesContent);
    
    // Write validation schemas file
    const validationContent = [
      '/**',
      ' * Auto-generated Zod validation schemas from OpenAPI specification',
      ' * DO NOT EDIT MANUALLY - This file is regenerated automatically',
      ' */',
      '',
      "import { z } from 'zod';",
      '',
      ...types.validationSchemas
    ].join('\n');
    
    writeFileSync(join(outputDir, 'api-validation.ts'), validationContent);
    
    console.log('✅ Generated TypeScript types and validation schemas');
  }
}

// CLI usage
if (import.meta.main) {
  const specPath = './docs/api/openapi.yaml';
  const outputDir = './src/types/generated';
  
  try {
    const generator = new OpenAPITypeGenerator(specPath);
    generator.writeGeneratedFiles(outputDir);
    console.log('🎉 API types generation completed successfully!');
  } catch (error) {
    console.error('❌ Failed to generate API types:', error);
    process.exit(1);
  }
}