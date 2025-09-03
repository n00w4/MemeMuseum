# MEMEMUSEUM

MEMEMUSEUM è una piattaforma web dedicata alla condivisione e scoperta di **meme**.  
Il progetto è stato sviluppato come esercitazione universitaria con stack **Angular/TypeScript** per il frontend e **Express.js/TypeScript** per il backend.

---

## Funzionalità principali

### Utenti non autenticati
- Esplorazione libera di tutti i meme.
- Visualizzazione della sezione **"Meme del giorno"**, selezionato tramite algoritmo di rotazione.
- Ricerca e filtraggio dei meme:
  - per **data di caricamento**,
  - per **tag associati**,
  - con **risultati paginati** (max 10 per pagina).
- Ordinamento dei risultati per:
  - **data**,
  - **upvote/downvote** ricevuti.

### Utenti autenticati
- Registrazione e login per accedere a funzionalità avanzate.
- **Caricamento di meme** con immagine e uno o più tag descrittivi.
- Possibilità di:
  - **commentare** i meme,
  - **votare** con upvote/downvote.

---

## Stack Tecnologico

### Frontend
- [Angular](https://angular.io/) (TypeScript)
- UI responsive con componenti modulari

### Backend
- [Express.js](https://expressjs.com/) (TypeScript)
- Architettura REST API
- Gestione autenticazione e sessioni
- Routing per caricamento, ricerca e interazioni con i meme

### Database
- SQLite3

---

## Autore

Progetto sviluppato per il corso universitario di Web Technologies.
- [Luigi Cesaro](https://github.com/n00w4/)

