import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// weekday : 1 = dimanche, 2 = lundi … 7 = samedi (convention iOS / Expo)
const weekly = (weekday, hour, minute) => ({
  type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
  weekday,
  hour,
  minute,
});

const PLAN = [
  ...[2, 3, 4, 5, 6].map((d) => ({
    title: '10 prospects aujourd’hui',
    body: 'Appels, mails, relances. On ne lâche rien avant midi.',
    trigger: weekly(d, 9, 0),
  })),
  ...[2, 3, 4, 5, 6].map((d) => ({
    title: 'Séance du jour',
    body: 'Coche tes exercices et note tes charges dans Le Carnet.',
    trigger: weekly(d, 18, 0),
  })),
  { title: 'Nouveauté de la semaine', body: 'Tu as prévu ta première fois de la semaine ? Il reste 3 jours.', trigger: weekly(5, 12, 30) },
  { title: 'Ton bilan est prêt', body: 'Viens voir si tu as été une machine ou une flemmarde cette semaine.', trigger: weekly(1, 19, 0) },
];

export async function enableReminders() {
  const cur = await Notifications.getPermissionsAsync();
  let ok = cur.granted;
  if (!ok) ok = (await Notifications.requestPermissionsAsync()).granted;
  if (!ok) return false;
  await Notifications.cancelAllScheduledNotificationsAsync();
  for (const n of PLAN) {
    await Notifications.scheduleNotificationAsync({ content: { title: n.title, body: n.body }, trigger: n.trigger });
  }
  return true;
}

export async function disableReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
