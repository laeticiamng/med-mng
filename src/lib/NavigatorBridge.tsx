import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setNavigate } from "./navigation";

export default function NavigatorBridge() {
  let navigate: any;
  
  try {
    navigate = useNavigate();
  } catch (e) {
    // Router not available yet, skip setting up navigation
    console.warn('NavigatorBridge: Router context not available yet');
    return null;
  }
  
  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);
  
  return null;
}