# PRD Hackathon : Synthetica (AI Artist Label & Feed)

## 1. Vision et Objectif du Produit
**Theme cible :** *"Bring Something New to Life"*
**Probleme :** Lancer un nouvel artiste coute des millions et prend des annees. De plus, la musique generee par IA actuelle (Suno/Udio) est statique (on attend 2 minutes pour un resultat final).
**Solution :** **Synthetica** est la premiere plateforme "End-to-End" de creation d'idoles virtuelles. Elle permet aux labels (B2B) de sculpter des artistes IA en temps reel via un studio interactif, et aux fans (B2C) de consommer et d'influencer la direction artistique de ces idoles via un feed social.

---

## 2. Utilisateurs Cibles (Personas)
1. **Le "A&R" / Directeur Artistique (B2B) :** Travaille pour un label. Cherche a capitaliser sur une micro-tendance TikTok. Il a besoin d'outils pour generer un lore, un visage coherent, de la musique modulable et un clip video.
2. **Le Fan (B2C) :** Scrolle sur son telephone. Veut decouvrir de nouvelles musiques visuelles et interagir avec l'artiste (ex: voter pour que le prochain son soit plus "sombre" ou "rap").

---

## 3. Perimetre du MVP (Ce qu'on code aujourd'hui, ni plus ni moins)
*Ne perdez pas de temps sur un systeme de login ou une base de donnees complexe. Hardcodez les credentials si besoin, le jury juge la demo de l'IA !*

### Fonctionnalite 1 : Le "Creator Studio" (Dashboard Web B2B)
*   **Generateur de Lore (Gemini 3) :** Un input texte (*ex: "Fille cyborg de Neo-Paris, fait de la techno triste"*). Gemini 3 genere une biographie, des traits de personnalite et des paroles.
*   **Identite Visuelle (Nano Banana 2) :** Generation du visage de l'artiste. *Hack pour le jury : montrez que l'IA garde le meme visage sur 2 images differentes pour prouver la "Character Consistency".*
*   **Studio Lyria RealTime :** Une interface simple avec un bouton "Generer" et 2 sliders (ex: Tempo, Intensite) qui modifient le son **en direct** grace a l'API Lyria `v1alpha`.
*   **Generateur de Clip (Veo 3.1) :** Un bouton qui combine la musique Lyria et l'image Nano Banana pour generer une courte video verticale (9:16) de 10 secondes.

### Fonctionnalite 2 : Le "Fan Feed" (Vue Mobile B2C)
*   **Interface TikTok-like :** Une vue mobile plein ecran (swipe vertical) qui lit les clips videos (9:16) generes par Veo 3.1.
*   **Bouton "Influence" :** Au lieu d'un simple "Like", un bouton interactif *"Orienter le prochain son"* (ex: l'utilisateur clique sur un tag "Plus de Basses"). *Pour le hackathon, simulez juste le fait que cette data repart vers le dashboard B2B.*

---

## 4. Stack Technique (A respecter pour le Google DeepMind/CV Hack)
*   **Front-end (Interdit d'utiliser Streamlit !) :** React / Next.js avec TailwindCSS. Faites une interface tres sombre et neon (style studio de musique moderne).
*   **Back-end :** Node.js / Express ou Python FastAPI (pour faire le pont entre votre front et les API Google).
*   **IA & Modeles (L'ADN du projet) :**
    *   `Gemini 3` : Text-to-text (Lore, Prompts).
    *   `Nano Banana 2` : Text-to-Image (Avatars coherents).
    *   `Lyria RealTime API` : Text-to-Audio continu.
    *   `Veo 3.1` : Image+Audio-to-Video (Clips 9:16 synchronises).

---

## 5. Le Flow de la Demo Live (Le script pour 17h15)
*La demo dure 3 minutes. Tout doit etre fluide.*
1. **(0:00 - 0:30) Le Pitch :** *"Voici Synthetica. Creons la prochaine popstar virale en 2 minutes."*
2. **(0:30 - 1:30) Le B2B :** Vous tapez un prompt en direct. L'avatar apparait. Vous lancez l'audio Lyria, vous bougez un slider en direct pour montrer que la musique reagit au quart de tour. Vous cliquez sur "Generer le clip".
3. **(1:30 - 2:15) Le B2C :** Vous basculez la presentation sur une vue smartphone. Vous scrollez, la video generee apparait. Vous cliquez sur le bouton "Influence" pour montrer que le fan prend le controle.
4. **(2:15 - 3:00) Q&A :** Conclusion fracassante et place aux questions du jury.

---

## 6. Plan de bataille immediat (13h00 - 17h00)
Repartissez-vous les taches **maintenant** :

*   **Hacker 1 (Front-end B2B - "Le Dashboard") :** Monte les composants React du Studio. L'interface doit faire tres "Pro".
*   **Hacker 2 (Integration Lyria & Gemini) :** Va sur Google AI Studio. Connecte l'API Lyria RealTime et Gemini 3 au backend. Assure-toi que la latence de Lyria est geree.
*   **Hacker 3 (Integration Video Veo 3.1 & Nano Banana 2) :** Recupere les credits GCP via le lien du reglement. Fais marcher la generation d'images consistantes et de la video verticale.
*   **Hacker 4 (Front-end B2C & Pitch) :** Code le clone de TikTok en CSS/React (tres rapide a faire avec des templates Tailwind). Ecris le script de la demo mot pour mot.

**Regle d'or jusqu'a 16h30 :** Si une feature complexe bug (ex: connecter la vraie database), virez-la et mettez de la fausse donnee (mock data). **Seules les API Google doivent generer de la vraie data en direct pour respecter le reglement.**
