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
    let report = this.buildHeader(reportType, user);
    let total = 0;

    for (const item of items) {
      if (this.canSee(user, item)) {
        const priority = user.role === 'ADMIN' && item.value > 1000;
        report += this.buildRow(reportType, user, item, priority);
        total += item.value;
      }
    }

    report += this.buildFooter(reportType, total);
    return report.trim();
  }

  canSee(user, item) {
    if (user.role === 'ADMIN') {
      return true;
    }
    return user.role === 'USER' && item.value <= 500;
  }

  buildHeader(reportType, user) {
    if (reportType === 'CSV') {
      return 'ID,NOME,VALOR,USUARIO\n';
    }
    if (reportType === 'HTML') {
      return (
        '<html><body>\n' +
        '<h1>Relatório</h1>\n' +
        `<h2>Usuário: ${user.name}</h2>\n` +
        '<table>\n' +
        '<tr><th>ID</th><th>Nome</th><th>Valor</th></tr>\n'
      );
    }
    return '';
  }

  buildRow(reportType, user, item, priority) {
    if (reportType === 'CSV') {
      return `${item.id},${item.name},${item.value},${user.name}\n`;
    }
    if (reportType === 'HTML') {
      const style = priority ? ' style="font-weight:bold;"' : '';
      return `<tr${style}><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>\n`;
    }
    return '';
  }

  buildFooter(reportType, total) {
    if (reportType === 'CSV') {
      return `\nTotal,,\n${total},,\n`;
    }
    if (reportType === 'HTML') {
      return `</table>\n<h3>Total: ${total}</h3>\n</body></html>\n`;
    }
    return '';
  }
}
