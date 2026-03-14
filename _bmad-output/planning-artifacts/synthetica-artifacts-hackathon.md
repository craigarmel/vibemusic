Il est 13h00, vous avez moins de 4 heures avant la soumission sur le portail du hackathon (17h00). Ce **PRD (Product Requirements Document) "Spécial Hackathon"** est conçu pour aller droit au but : éliminer le superflu et se concentrer uniquement sur ce qui va faire gagner des points au jury (Impact, Démo Live, Créativité).

Voici le PRD de votre projet, nom de code : **Synthetica** (ou le nom de votre choix).

---

# 📄 PRD Hackathon : Synthetica (AI Artist Label & Feed)

## 1. Vision et Objectif du Produit
**Thème ciblé :** *"Bring Something New to Life"*
**Problème :** Lancer un nouvel artiste coûte des millions et prend des années. De plus, la musique générée par IA actuelle (Suno/Udio) est statique (on attend 2 minutes pour un résultat final).
**Solution :** **Synthetica** est la première plateforme "End-to-End" de création d'idoles virtuelles. Elle permet aux labels (B2B) de sculpter des artistes IA en temps réel via un studio interactif, et aux fans (B2C) de consommer et d'influencer la direction artistique de ces idoles via un feed social.

---

## 2. Utilisateurs Cibles (Personas)
1. **Le "A&R" / Directeur Artistique (B2B) :** Travaille pour un label. Cherche à capitaliser sur une micro-tendance TikTok. Il a besoin d'outils pour générer un lore, un visage cohérent, de la musique modulable et un clip vidéo.
2. **Le Fan (B2C) :** Scrolle sur son téléphone. Veut découvrir de nouvelles musiques visuelles et interagir avec l'artiste (ex: voter pour que le prochain son soit plus "sombre" ou "rap").

---

## 3. Périmètre du MVP (Ce qu'on code aujourd'hui, ni plus ni moins)
*Ne perdez pas de temps sur un système de login ou une base de données complexe. Hardcodez les credentials si besoin, le jury juge la démo de l'IA !*

### Fonctionnalité 1 : Le "Creator Studio" (Dashboard Web B2B)
*   **Générateur de Lore (Gemini 3) :** Un input texte (*ex: "Fille cyborg de Neo-Paris, fait de la techno triste"*). Gemini 3 génère une biographie, des traits de personnalité et des paroles.
*   **Identité Visuelle (Nano Banana 2) :** Génération du visage de l'artiste. *Hack pour le jury : montrez que l'IA garde le même visage sur 2 images différentes pour prouver la "Character Consistency".*
*   **Studio Lyria RealTime :** Une interface simple avec un bouton "Générer" et 2 sliders (ex: Tempo, Intensité) qui modifient le son **en direct** grâce à l'API Lyria `v1alpha`.
*   **Générateur de Clip (Veo 3.1) :** Un bouton qui combine la musique Lyria et l'image Nano Banana pour générer une courte vidéo verticale (9:16) de 10 secondes.

### Fonctionnalité 2 : Le "Fan Feed" (Vue Mobile B2C)
*   **Interface TikTok-like :** Une vue mobile plein écran (swipe vertical) qui lit les clips vidéos (9:16) générés par Veo 3.1.
*   **Bouton "Influence" :** Au lieu d'un simple "Like", un bouton interactif *"Orienter le prochain son"* (ex: l'utilisateur clique sur un tag "Plus de Basses"). *Pour le hackathon, simulez juste le fait que cette data repart vers le dashboard B2B.*

---

## 4. Stack Technique (À respecter pour le Google DeepMind/CV Hack)
*   **Front-end (Interdit d'utiliser Streamlit !) :** React / Next.js avec TailwindCSS. Faites une interface très sombre et néon (style studio de musique moderne).
*   **Back-end :** Node.js / Express ou Python FastAPI (pour faire le pont entre votre front et les API Google).
*   **IA & Modèles (L'ADN du projet) :**
    *   `Gemini 3` : Text-to-text (Lore, Prompts).
    *   `Nano Banana 2` : Text-to-Image (Avatars cohérents).
    *   `Lyria RealTime API` : Text-to-Audio continu.
    *   `Veo 3.1` : Image+Audio-to-Video (Clips 9:16 synchronisés).

---

## 5. Le Flow de la Démo Live (Le script pour 17h15)
*La démo dure 3 minutes. Tout doit être fluide.*
1. **(0:00 - 0:30) Le Pitch :** *"Voici Synthetica. Créons la prochaine popstar virale en 2 minutes."*
2. **(0:30 - 1:30) Le B2B :** Vous tapez un prompt en direct. L'avatar apparaît. Vous lancez l'audio Lyria, vous bougez un slider en direct pour montrer que la musique réagit au quart de tour. Vous cliquez sur "Générer le clip".
3. **(1:30 - 2:15) Le B2C :** Vous basculez la présentation sur une vue smartphone. Vous scrollez, la vidéo générée apparaît. Vous cliquez sur le bouton "Influence" pour montrer que le fan prend le contrôle.
4. **(2:15 - 3:00) Q&A :** Conclusion fracassante et place aux questions du jury.

---

## 6. Plan de bataille immédiat (13h00 - 17h00)
Répartissez-vous les tâches **maintenant** :

*   🧑💻 **Hacker 1 (Front-end B2B - "Le Dashboard") :** Monte les composants React du Studio. L'interface doit faire très "Pro".
*   🧑💻 **Hacker 2 (Intégration Lyria & Gemini) :** Va sur Google AI Studio. Connecte l'API Lyria RealTime et Gemini 3 au backend. Assure-toi que la latence de Lyria est gérée.
*   🧑💻 **Hacker 3 (Intégration Vidéo Veo 3.1 & Nano Banana 2) :** Récupère les crédits GCP via le lien du règlement. Fais marcher la génération d'images consistantes et de la vidéo verticale.
*   🧑💻 **Hacker 4 (Front-end B2C & Pitch) :** Code le clone de TikTok en CSS/React (très rapide à faire avec des templates Tailwind). Écris le script de la démo mot pour mot.

**Règle d'or jusqu'à 16h30 :** Si une feature complexe bug (ex: connecter la vraie database), virez-la et mettez de la fausse donnée (mock data). **Seules les API Google doivent générer de la vraie data en direct pour respecter le règlement.**

Allez, au code ! Déployez sur Vercel à 16h45 pour être larges !