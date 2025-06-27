
-- Mise à jour des paroles musicales avec style Nekfeu complet
UPDATE edn_items_immersive 
SET 
  paroles_musicales = ARRAY[
    'CHANSON RANG A - "Colloque Singulier"

[Couplet 1]
Dans le cabinet, deux mondes qui se rencontrent
Paternaliste avant, mais maintenant on affronte
Une approche globale, bio-médico-psycho-sociale
Patient partenaire, plus jamais docile
Trois finalités convergent, c''est la base
Patient, médecin, société dans cette phase
Expertise médicale plus expérience vécue
Alliance thérapeutique, relation construite

[Refrain]
Colloque singulier, relation qui évolue
De soignant-soigné vers ce qui nous salue
Dignité, liberté, respect dans chaque geste
Empathie clinique, comprendre sans qu''on reste
Dans nos propres schémas, mettre de côté
L''humain au centre, jamais oublié

[Couplet 2]
Représentations de la maladie différentes
Conséquences biomédicales, expériences parlantes
Impact sur l''entourage, vécu qui se partage
Information du patient, communication sage
Facteurs contextuels, processus collaboratif
Verbal et non-verbal, dialogue constructif
Ajustement au stress, adaptation centrale
Stratégies de coping, résilience mentale

[Pont]
Mécanismes de défense face à la souffrance
Isolation, déplacement, projection en balance
Régression développement, déni de réalité
Attitudes inconscientes, vérité cachée
Performance diagnostique qui s''améliore
Paramètres stabilisés, chroniques qu''on dore
Indicateurs de santé, démarche qui progresse
Continuité des soins, jamais de faiblesse',

    'CHANSON RANG B - "Outils Pratiques"

[Couplet 1]
Quatre dimensions ACP, je les maîtrise
Explorer la maladie, expérience qu''on prise
Comprendre la globalité, terrain d''entente
Décision partagée, alliance permanente
Empathie clinique, état émotionnel
Comprendre sans vivre, fonction soignelle
Accepter sans subir, engagement verbal
Conviction du patient, non-verbal

[Refrain]
Prochaska-DiClemente, cycle motivationnel
Précontemplation, contemplation, c''est réel
Préparation, action, maintien ou rechute
Étape par étape, jamais de chute
Entretien motivationnel, méthode centrée
Motivation intrinsèque, objectif partagé
Collaboratif orienté, éducation du patient
Logique d''apprentissage, toujours constant

[Couplet 2]
Communication adaptée, trente pourcent verbal
Soixante-dix non-verbal, message essentiel
Regard, sourire, tenue, relation d''aide
Habiletés communicationnelles, jamais fade
Questions ouvertes, respect des silences
Questions fermées, reformulations, cadences
Verbaliser réalité, prise de conscience
Se sentir écouté, belle résilience

[Pont]
Annonce mauvaise nouvelle, structuration
Trois étapes claires, transformation
Avant, pendant, après, représentation
Projet personnalisé, adaptation
Temps d''écoute, mots qui résonnent
Processus constructif, personne
Changement de réflexion, posture facilitatrice
Véritable acteur santé, pratique bénéfice

[Outro]
Alliance thérapeutique, résultat pratique
Consultations successives, dynamique
Patient acteur de sa santé, c''est ça
Faciliter apprentissages, voilà
Repérage stade motivationnel, précis
Temporalité, lieu, tout est acquis
Rétroactions qualité, mise en forme
Information adaptée, nouvelle norme'
  ],
  
  updated_at = now()
WHERE slug = 'relation-medecin-malade';
