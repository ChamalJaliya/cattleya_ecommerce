import { useEffect, useState, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: ReactNode;
}

const Portal = ({ children }: PortalProps) => {
  const [mounted, setMounted] = useState(false);
  const [portalNode, setPortalNode] = useState<Element | null>(null);

  useEffect(() => {
    setMounted(true);
    setPortalNode(document.querySelector("#modal-portal"));
    return () => setMounted(false);
  }, []);

  return mounted && portalNode
    ? createPortal(children, portalNode)
    : null;
};

export default Portal; 