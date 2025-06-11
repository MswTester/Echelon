module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'ensure @Style without argument uses camelCase field',
    },
    schema: [],
  },
  create(context) {
    return {
      Decorator(node) {
        if (node.expression && node.expression.callee && node.expression.callee.name === 'Style') {
          if (node.expression.arguments.length === 0) {
            const prop = node.parent && node.parent.key && node.parent.key.name;
            if (prop && /-/.test(prop)) {
              context.report({ node, message: 'Field name should be camelCase when using @Style without arguments.' });
            }
          }
        }
      },
    };
  },
};
