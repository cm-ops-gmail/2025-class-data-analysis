import React from 'react';
import Image from 'next/image';
import Logo from './logo';

interface NavbarProps {
    children?: React.ReactNode;
}

const Navbar = ({ children }: NavbarProps) => {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Logo />
        </div>
        <div className="flex items-center gap-4">
          {children}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
