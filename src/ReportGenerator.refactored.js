const ADMIN_PRIORITY_VALUE = 1000;
const USER_MAX_VALUE = 500;

class CsvFormatter {
  header() {
    return 'ID,NOME,VALOR,USUARIO\n';
  }

  row(item, user) {
    return `${item.id},${item.name},${item.value},${user.name}\n`;
  }

  footer(total) {
    return `\nTotal,,\n${total},,\n`;
  }
}

class HtmlFormatter {
  header(user) {
    return (
      '<html><body>\n' +
      '<h1>Relatório</h1>\n' +
      `<h2>Usuário: ${user.name}</h2>\n` +
      '<table>\n' +
      '<tr><th>ID</th><th>Nome</th><th>Valor</th></tr>\n'
    );
  }

  row(item, user, priority) {
    const style = priority ? ' style="font-weight:bold;"' : '';
    return `<tr${style}><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>\n`;
  }

  footer(total) {
    return `</table>\n<h3>Total: ${total}</h3>\n</body></html>\n`;
  }
}

const FORMATTERS = {
  CSV: new CsvFormatter(),
  HTML: new HtmlFormatter(),
};

// Regras de cada perfil: quais itens ele pode ver e quais ficam em destaque
const ROLE_RULES = {
  ADMIN: {
    canSee: () => true,
    isPriority: (item) => item.value > ADMIN_PRIORITY_VALUE,
  },
  USER: {
    canSee: (item) => item.value <= USER_MAX_VALUE,
    isPriority: () => false,
  },
};

// Perfil desconhecido não vê nenhum item
const NO_ACCESS = {
  canSee: () => false,
  isPriority: () => false,
};

export class ReportGenerator {
  constructor(database) {
    this.db = database;
  }

  /**
   * Gera um relatório de itens baseado no tipo e no usuário.
   * - Admins veem tudo.
   * - Users comuns só veem itens com valor <= 500.
   */
  generateReport(reportType, user, items) {
    const formatter = FORMATTERS[reportType];
    if (!formatter) {
      return '';
    }

    const rules = ROLE_RULES[user.role] || NO_ACCESS;
    const visibleItems = items.filter((item) => rules.canSee(item));

    let report = formatter.header(user);
    for (const item of visibleItems) {
      report += formatter.row(item, user, rules.isPriority(item));
    }
    report += formatter.footer(this.sumValues(visibleItems));

    return report.trim();
  }

  sumValues(items) {
    return items.reduce((sum, item) => sum + item.value, 0);
  }
}
