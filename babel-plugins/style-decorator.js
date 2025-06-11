module.exports = function ({ types: t }) {
  return {
    visitor: {
      Decorator(path) {
        const expr = path.node.expression;
        if (!t.isCallExpression(expr)) return;
        const callee = expr.callee;
        if (!t.isIdentifier(callee, { name: 'Style' })) return;
        if (expr.arguments.length > 0) return;
        const property = path.parentKey === 'decorators' && path.parentPath.node.key;
        if (!property || !t.isIdentifier(property)) return;
        const kebab = property.name.replace(/([A-Z])/g, '-$1').toLowerCase();
        expr.arguments.push(t.stringLiteral(kebab));
      },
    },
  };
};
