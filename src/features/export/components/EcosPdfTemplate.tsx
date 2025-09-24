import React from 'react';
import {
  EcosPdfState,
  EcosPrintableScenario,
} from '../hooks/useEcosPdfExport';

interface EcosPdfTemplateProps {
  scenario: EcosPrintableScenario;
  printState: EcosPdfState | null;
  itemUrl: string;
}

const formatDate = (date: Date) => {
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(date);
  } catch {
    return date.toLocaleString('fr-FR');
  }
};

export const EcosPdfTemplate: React.FC<EcosPdfTemplateProps> = ({
  scenario,
  printState,
  itemUrl,
}) => {
  if (!printState) {
    return null;
  }

  return (
    <div className="ecos-print-root" aria-hidden>
      <header className="ecos-print-header">
        <div>
          <p className="ecos-print-meta" aria-label="Identifiants ECOS">
            Simulation ECOS • {scenario.id}
          </p>
          <h1 className="ecos-print-title">{scenario.title}</h1>
          <p className="ecos-print-subtitle">{scenario.pitch}</p>
          <p className="ecos-print-meta">
            Spécialité : {scenario.specialty} • Durée estimée : {scenario.duration} minutes
          </p>
          <p className="ecos-print-meta">
            Patient : {scenario.patient.name} ({scenario.patient.age} ans, {scenario.patient.sex})
          </p>
          <p className="ecos-print-meta">{scenario.patient.background}</p>
          <p className="ecos-print-meta">Exporté le {formatDate(printState.generatedAt)}</p>
        </div>
        <div className="ecos-print-qr">
          <img src={printState.qrCodeDataUrl} alt="QR code vers l'item EDN associé" />
          <p className="ecos-print-meta">Scanner pour ouvrir l'item associé</p>
          <p className="ecos-print-meta" style={{ wordBreak: 'break-all', textAlign: 'center' }}>
            {itemUrl}
          </p>
        </div>
      </header>

      <section className="ecos-print-section" aria-labelledby="ecos-patient-profile">
        <h2 id="ecos-patient-profile">Profil patient</h2>
        <p className="ecos-print-meta">
          {scenario.patient.name} • {scenario.patient.age} ans • {scenario.patient.sex}
        </p>
        <p className="ecos-print-meta">{scenario.patient.background}</p>
      </section>

      {scenario.steps.map((step, index) => (
        <section
          key={`${step.title}-${index}`}
          className="ecos-print-section"
          aria-labelledby={`ecos-step-${index}`}
        >
          <h2 id={`ecos-step-${index}`}>
            {index + 1}. {step.title}
          </h2>
          {step.subtitle ? <p className="ecos-print-meta">{step.subtitle}</p> : null}

          {step.questions?.length ? (
            <div>
              <h3 className="ecos-print-meta" style={{ fontWeight: 600, marginTop: '2mm' }}>
                Questions clés
              </h3>
              <ul>
                {step.questions.map((question, questionIndex) => (
                  <li key={`question-${index}-${questionIndex}`}>{question}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {step.actions?.length ? (
            <div>
              <h3 className="ecos-print-meta" style={{ fontWeight: 600, marginTop: '2mm' }}>
                Actions à réaliser
              </h3>
              <ul>
                {step.actions.map((action, actionIndex) => (
                  <li key={`action-${index}-${actionIndex}`}>{action}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {step.elements?.length ? (
            <div>
              <h3 className="ecos-print-meta" style={{ fontWeight: 600, marginTop: '2mm' }}>
                Points de synthèse
              </h3>
              <ul>
                {step.elements.map((element, elementIndex) => (
                  <li key={`element-${index}-${elementIndex}`}>{element}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ))}
    </div>
  );
};
