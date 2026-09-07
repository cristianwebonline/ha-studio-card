# Faber Layout

Un pannello nella barra laterale di Home Assistant per comporre le dashboard trascinando le card già pronte — o descrivendo a parole cosa serve e facendoselo generare — invece di scrivere configurazioni a mano o affidarsi all'editor generico di Lovelace.

## Cos'è (e cosa non è)

Faber Layout non è un'altra card da aggiungere a una dashboard esistente: è un'app a sé, pensata per stare da sola in una vista dedicata (di tipo "panel") con una sua voce nel menu laterale. Da lì si sceglie una dashboard/vista già esistente e la si modifica visivamente.

## Cosa si può fare

- **Scegliere una vista** cercandola tra tutte le dashboard esistenti.
- **Vedere la vista com'è davvero**: le card già presenti vengono mostrate con la loro grafica reale, non un abbozzo.
- **Descrivere a parole cosa serve** ("presa della lavatrice in lavanderia") e farselo generare: Claude sceglie la card più adatta e i sensori reali giusti tra le entità di casa, poi si apre subito l'editor per l'ultimo controllo.
- **Trascinare card pronte** dalla libreria (in basso) su una sezione — un template per ciascuna forma già disponibile nella famiglia Faber: Mini Card (Dispositivo o Stanza), Centro Bucato (Lavatrice/Asciugatrice), Centro Elettrodomestici (Lavastoviglie/Forno/Piano induzione/Frigorifero/Congelatore/Stanza), Centro Sicurezza (Porta blindata), Energia Consumi.
- **Toccare una card sulla tela** per aprire il suo editor vero — lo stesso che si vede modificando quella card da Home Assistant, non una copia.
- **Riordinare** le card trascinandole dentro la loro sezione.
- **Duplicare o eliminare** una card dal suo pannello di modifica.
- **Salvare** — scrive davvero sulla dashboard scelta.

## Cosa non fa (ancora)

- Non gestisce tipi di card diversi da quelli della famiglia Faber (li mostra come "non gestiti", senza romperli, ma non li si può modificare da qui).
- Non gestisce righe/colonne o dimensioni fini delle card — ogni sezione è una lista verticale.
- Non crea dashboard o viste nuove da zero — modifica quelle che esistono già.
- Non funziona su dashboard salvate come file YAML (sola lettura).

## Installazione (HACS)

1. HACS → Repository personalizzati → aggiungi `cristianwebonline/ha-studio-card` come "Lovelace".
2. Installa "Faber Layout" e aggiungi la risorsa dashboard.
3. Crea (o fatti creare) una dashboard con un'unica vista di tipo "panel" contenente `{"type": "custom:studio-card"}`, visibile nella barra laterale.

## Sicurezza

Faber Layout scrive direttamente sulle dashboard tramite l'API di Home Assistant — va installato solo da chi ha accesso da amministratore, come tutte le altre card di questa famiglia. La funzione "Descrivi e genera" passa dal proxy `/api/faber_control/` già esistente per raggiungere il backend che parla con Claude.
