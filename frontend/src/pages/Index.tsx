import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadState } from "@/lib/storage";

const Index = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const s = loadState();
    navigate(s.loggedIn ? "/landing" : "/login", { replace: true });
  }, [navigate]);
  return null;
};

export default Index;
