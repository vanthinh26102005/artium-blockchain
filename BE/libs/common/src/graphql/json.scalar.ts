import { GraphQLScalarType, Kind } from 'graphql';

export const GraphQLJSONObject = new GraphQLScalarType({
  name: 'JSONObject',
  description: 'JSON custom scalar type',
  parseValue(value: any) {
    return value;
  },
  serialize(value: any) {
    return value;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.OBJECT) {
      const value = Object.create(null);
      ast.fields.forEach((field) => {
        // @ts-ignore
        value[field.name.value] = this.parseLiteral(field.value);
      });
      return value;
    }
    return null;
  },
});
