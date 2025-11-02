export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__center">
          <h3 className="footer__title">Task Manager</h3>
          <p className="muted">Organize your work efficiently with a clean, modern interface.</p>
        </div>
        <div className="footer__bottom">
          <p className="muted">© {currentYear} Task Manager. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
