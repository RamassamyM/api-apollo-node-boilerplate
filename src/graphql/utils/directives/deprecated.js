import { SchemaDirectiveVisitor } from 'graphql-tools'

/**
 * @class
 * @classdesc Create a deprecated schema directive
 * See graphql-tools
 */
export class Deprecated extends SchemaDirectiveVisitor {
  visitObject (object) {
    this._deprecate(object)
  }
  visitFieldDefinition (field) {
    this._deprecate(field)
  }
  visitEnumValue (value) {
    this._deprecate(value)
  }
  _deprecate (element) {
    // Add some metadata to the object that the GraphQL server
    // can use later to display deprecation warnings.
    element.isDeprecated = true
    element.deprecationReason = this.args.reason
  }
}
