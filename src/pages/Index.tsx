import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { PremiumLayout } from "@/components/layout/PremiumLayout";
import { PremiumHomePage } from "@/components/pages/PremiumHomePage";
import { ConsistentBackground } from "@/components/layout/ConsistentBackground";

const Index = () => {
  return (
    <ConsistentBackground variant="primary">
      <PremiumLayout>
        <PremiumHomePage />
      </PremiumLayout>
    </ConsistentBackground>
  );
};

export default Index;