const Footer = () => {
  return (
    <footer className="w-full bg-card border-t border-border mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">
            © {new Date().getFullYear()} IT Committee IIM Bodh Gaya. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
