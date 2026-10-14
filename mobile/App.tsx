import React, { useEffect, useState } from 'react';
import { Alert, Linking, Platform, Pressable, SafeAreaView, ScrollView, Share, StyleSheet, Text, TextInput, View, useColorScheme } from 'react-native';
import * as Contacts from 'expo-contacts';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import { StatusBar } from 'expo-status-bar';

type Screen = 'Accueil' | 'Lieux sûrs' | 'Rencontre' | 'SOS' | 'Profil';
const PRIDE = ['#E879AE','#F2A66F','#F2D36F','#72CDA4','#73B9F2','#A996EE'];
const KEY = 'queersafe.emergencyContact';
const darkPalette = { bg:'#15111A', card:'#211B28', text:'#FFF8FF', muted:'#C9BDCE', border:'#44364C', field:'#19141F' };
const lightPalette = { bg:'#FFF8FC', card:'#FFFFFF', text:'#2B1B2C', muted:'#6A586D', border:'#E7D2E4', field:'#FFF4FA' };

export default function App() {
  const system = useColorScheme();
  const [screen,setScreen] = useState<Screen>('Accueil');
  const [contact,setContact] = useState<{name:string;phone:string}|null>(null);\n  const [contactOptions,setContactOptions] = useState<{id:string;name:string;phone:string}[]>([]);
  const [meetName,setMeetName] = useState('');
  const [meetPlace,setMeetPlace] = useState('');
  const [meetDate,setMeetDate] = useState('');
  const [meetTime,setMeetTime] = useState('');
  const [trustedName,setTrustedName] = useState('');
  const [codeword,setCodeword] = useState('');
  const [emergencyNumber,setEmergencyNumber] = useState('');
  const [busy,setBusy] = useState(false);
  const dark = system !== 'light';
  const C = dark ? darkPalette : lightPalette;

  useEffect(()=>{ SecureStore.getItemAsync(KEY).then(raw=>{if(raw){try{setContact(JSON.parse(raw));}catch{}}}).catch(()=>{}); },[]);

  async function chooseContact() {
    const permission = await Contacts.requestPermissionsAsync();
    if(permission.status !== 'granted') { Alert.alert('Autorisation nécessaire','Autorise l’accès aux contacts pour choisir une personne de confiance. Tu peux aussi saisir son numéro manuellement.'); return; }
    const result = await Contacts.getContactsAsync({ fields:[Contacts.Fields.PhoneNumbers], sort:Contacts.SortTypes.FirstName });
    const usable = result.data.filter(p=>p.phoneNumbers?.some(n=>n.number));
    if(!usable.length){Alert.alert('Aucun contact trouvé','Ajoute un numéro dans le carnet d’adresses ou saisis-le manuellement dans Profil.');return;}
    setContactOptions(usable.map((p,i)=>({id:p.id||String(i),name:p.name,phone:p.phoneNumbers?.find(n=>n.number)?.number||''})).filter(p=>p.phone));
    setScreen('Profil');
  }

  async function saveManualContact() {
    if(!trustedName.trim() || !contact?.phone.trim()) { Alert.alert('Contact incomplet','Choisis un contact ou saisis son numéro dans le champ ci-dessous.'); return; }
    const value={name:trustedName.trim(),phone:contact.phone.trim()};
    setContact(value); await SecureStore.setItemAsync(KEY,JSON.stringify(value)); Alert.alert('Enregistré','Contact de confiance enregistré sur cet appareil.');
  }

  async function getLocationLine() {
    try {
      const p=await Location.requestForegroundPermissionsAsync();
      if(p.status!=='granted') return 'Position non partagée (autorisation refusée).';
      const loc=await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.Balanced});
      return 'Ma position : https://maps.google.com/?q='+loc.coords.latitude+','+loc.coords.longitude;
    } catch { return 'Position indisponible.'; }
  }

  async function sendSOS(kind:'sms'|'call') {
    if(busy) return;
    setBusy(true);
    try {
      const locationLine=await getLocationLine();
      const message='SOS QUEERSAFE — J’ai besoin d’aide. Si tu peux, appelle-moi ou contacte les secours.\n'+locationLine;
      if(kind==='sms') {
        const phone=contact?.phone;
        if(!phone){Alert.alert('Aucun contact enregistré','Ajoute d’abord une personne de confiance dans Profil.');return;}
        const url=Platform.OS==='ios' ? 'sms:'+encodeURIComponent(phone)+'&body='+encodeURIComponent(message) : 'sms:'+encodeURIComponent(phone)+'?body='+encodeURIComponent(message);
        const supported=await Linking.canOpenURL(url);
        if(supported) await Linking.openURL(url); else await Share.share({message:'À envoyer à '+phone+' :\n'+message});
      } else {
        const number=emergencyNumber.trim();
        if(!number){Alert.alert('Numéro manquant','Saisis le numéro d’urgence local ou appelle ton contact de confiance.');return;}
        Alert.alert('Appeler les urgences ?', 'QueerSafe va ouvrir l’application Téléphone. Vérifie le numéro avant l’appel.',[
          {text:'Annuler',style:'cancel'},
          {text:'Ouvrir le téléphone',style:'destructive',onPress:()=>Linking.openURL('tel:'+number).catch(()=>Alert.alert('Appel impossible','Compose le numéro manuellement.'))}
        ]);
      }
    } finally { setBusy(false); }
  }

  async function makeMeetupMessage() {
    const locationLine=meetPlace.trim()?'Lieu : '+meetPlace.trim():'Lieu à confirmer';
    const text=['PLAN DE RENCONTRE · QUEERSAFE',meetName.trim()?'Rencontre : '+meetName.trim():'Rencontre : non précisée',locationLine,meetDate.trim()?'Date : '+meetDate.trim():'',meetTime.trim()?'Heure : '+meetTime.trim():'',contact?'Contact de confiance : '+contact.name+' ('+contact.phone+')':'Contact de confiance : à définir',codeword.trim()?'Mot-code : '+codeword.trim():'','Si je ne donne pas de nouvelles à l’heure convenue, contacte-moi puis suis le plan dont nous avons discuté.'].filter(Boolean).join('\n');
    await Share.share({message:text,title:'Mon plan QueerSafe'});
  }

  const text=(s:string,style:any={})=><Text style={[{color:C.text},style]}>{s}</Text>;
  const button=(label:string,onPress:()=>void,variant:'primary'|'secondary'|'danger'='primary')=><Pressable accessibilityRole="button" onPress={onPress} style={({pressed})=>[styles.button,{backgroundColor:variant==='danger'?'#D93662':variant==='primary'?'#D98ABF':C.card,borderColor:variant==='secondary'?C.border:'transparent',opacity:pressed?.78:1}]}><Text style={[styles.buttonText,{color:variant==='secondary'?C.text:'#271323'}]}>{label}</Text></Pressable>;
  const field=(label:string,value:string,onChangeText:(v:string)=>void,placeholder:string,keyboardType:any='default')=><View style={styles.fieldWrap}><Text style={[styles.label,{color:C.text}]}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={C.muted} keyboardType={keyboardType} autoCapitalize="sentences" style={[styles.input,{backgroundColor:C.field,color:C.text,borderColor:C.border}]} /></View>;
  const card=(title:string,body:string,children?:React.ReactNode)=><View style={[styles.card,{backgroundColor:C.card,borderColor:C.border}]}><Text style={[styles.cardTitle,{color:C.text}]}>{title}</Text><Text style={[styles.body,{color:C.muted}]}>{body}</Text>{children}</View>;

  function renderScreen() {
    if(screen==='Accueil') return <>{card('La sécurité, sans jugement','Prépare tes rencontres, garde tes contacts utiles et demande de l’aide plus facilement.')}{card('Préparer une rencontre','Crée un plan que tu peux partager toi-même.',button('Créer mon plan',()=>setScreen('Rencontre')))}{card('Ton bouton SOS','Un raccourci vers un contact de confiance ou les urgences. Le téléphone te demandera de confirmer les actions.',button('Ouvrir le SOS',()=>setScreen('SOS'),'danger'))}{card('Lieux sûrs','Le répertoire sera alimenté avec des lieux réellement vérifiés. Aucun lieu fictif n’est présenté comme sûr.',button('Explorer les lieux',()=>setScreen('Lieux sûrs'),'secondary'))}</>;
    if(screen==='Lieux sûrs') return <>{card('Carte communautaire','Le répertoire en ligne et la carte ne sont pas encore connectés. Cette version ne collecte pas de lieux et ne prétend pas vérifier leur sécurité.')}{card('Ajouter un lieu de confiance','Les prochaines étapes incluent une proposition de lieu, une vérification par modération, des dates de mise à jour et un mécanisme de correction.')}{card('Règle QueerSafe','Ne publie pas l’adresse privée d’une personne ni d’informations qui pourraient l’exposer. Un lieu doit être vérifié avant d’être marqué comme recommandé.')}</>;
    if(screen==='Rencontre') return <>{card('Plan de rencontre','Renseigne les informations utiles, puis partage le plan avec une personne de confiance.')}{field('Pseudo (facultatif)',meetName,setMeetName,'Pseudo sur Grindr, Tinder…')}{field('Lieu prévu',meetPlace,setMeetPlace,'Adresse ou lieu public')}{field('Date',meetDate,setMeetDate,'Ex. 2026-10-20')}{field('Heure',meetTime,setMeetTime,'Ex. 19:30')}{field('Mot-code',codeword,setCodeword,'Phrase convenue pour demander de l’aide')}{card('Contact de confiance',contact?contact.name+' · '+contact.phone:'Aucun contact sélectionné.',button('Choisir dans mes contacts',chooseContact,'secondary'))}{button('Partager mon plan',makeMeetupMessage)}</>;
    if(screen==='SOS') return <>{card('Besoin d’aide maintenant ?','Si le danger est immédiat, contacte les services d’urgence locaux. QueerSafe ne transmet pas encore d’alerte à la communauté et ne peut pas garantir qu’une personne viendra.',<Text style={[styles.body,{color:C.muted}]}>Ton contact de confiance : {contact?contact.name+' · '+contact.phone:'aucun contact configuré'}</Text>)}{button('ENVOYER UN SMS SOS',()=>sendSOS('sms'),'danger')}{button('APPELER LES URGENCES',()=>sendSOS('call'),'danger')}{field('Numéro d’urgence local',emergencyNumber,setEmergencyNumber,'Vérifie le numéro de ton pays','phone-pad')}{text('Le SMS est préparé dans l’application Messages : tu gardes le contrôle et dois appuyer sur Envoyer. La position n’est demandée qu’au moment où tu déclenches le SOS.',styles.smallNote)}{button('Configurer mon contact',()=>setScreen('Profil'),'secondary')}</>;
    return <>{card('Identité QueerSafe','Q+ · Couleurs Pride · Thème clair ou sombre automatique.')}{card('Contact de confiance',contact?contact.name+' · '+contact.phone:'Aucun contact enregistré.',button('Sélectionner dans le téléphone',chooseContact,'secondary'))}{contactOptions.length>0?card('Choisis un contact', 'Les contacts affichés proviennent du carnet d’adresses de ton téléphone.',<View style={{gap:8}}>{contactOptions.map(p=><Pressable key={p.id} onPress={()=>{const value={name:p.name,phone:p.phone};setContact(value);setContactOptions([]);SecureStore.setItemAsync(KEY,JSON.stringify(value)).catch(()=>{});Alert.alert('Contact enregistré',p.name+' a été ajouté comme contact de confiance.');}} style={[styles.button,{backgroundColor:C.field,borderColor:C.border}]}><Text style={{color:C.text,fontWeight:'700'}}>{p.name} · {p.phone}</Text></Pressable>)}</View>):null}{field('Nom du contact (saisie manuelle)',trustedName,setTrustedName,'Prénom ou surnom')}{field('Numéro du contact (saisie manuelle)',contact?.phone||'',v=>setContact({name:trustedName||'Contact de confiance',phone:v}),'Numéro avec indicatif pays','phone-pad')}{button('Enregistrer le contact',saveManualContact)}{card('Vie privée','Les informations du contact sont conservées localement sur cet appareil. Aucune alerte communautaire n’est active dans cette première version.')}{card('Urgences','Saisis et vérifie le numéro d’urgence local avant d’appeler. Aucun numéro universel n’est présumé.')}</>;
  }

  return <SafeAreaView style={[styles.safe,{backgroundColor:C.bg}]}><StatusBar style={dark?'light':'dark'} /><View style={styles.prideBar}>{PRIDE.map(color=><View key={color} style={{flex:1,backgroundColor:color}} />)}</View><View style={styles.header}><View style={styles.logo}><Text style={styles.logoText}>Q+</Text></View><View><Text style={[styles.brand,{color:C.text}]}>QueerSafe</Text><Text style={[styles.tagline,{color:C.muted}]}>Des rencontres plus sûres, ensemble.</Text></View></View><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><Text style={[styles.eyebrow,{color:'#D98ABF'}]}>{screen.toUpperCase()}</Text>{renderScreen()}<Text style={[styles.disclaimer,{color:C.muted}]}>Prototype en développement · Le SOS ne remplace pas les services d’urgence.</Text></ScrollView><View style={[styles.nav,{backgroundColor:C.card,borderColor:C.border}]}>{(['Accueil','Lieux sûrs','Rencontre','SOS','Profil'] as Screen[]).map((s,i)=><Pressable key={s} onPress={()=>setScreen(s)} accessibilityRole="button" accessibilityState={{selected:screen===s}} style={styles.navItem}><Text style={{fontSize:19}}>{['⌂','⌖','♡','!','☻'][i]}</Text><Text numberOfLines={1} style={{fontSize:10,fontWeight:screen===s?'800':'500',color:screen===s?'#D98ABF':C.muted}}>{s}</Text></Pressable>)}</View></SafeAreaView>;
}

const styles=StyleSheet.create({
 safe:{flex:1}, prideBar:{height:5,flexDirection:'row'}, header:{flexDirection:'row',alignItems:'center',gap:12,paddingHorizontal:20,paddingTop:14,paddingBottom:12},logo:{width:48,height:48,borderRadius:16,alignItems:'center',justifyContent:'center',backgroundColor:'#E6A0CC',borderWidth:2,borderColor:'#BBA6F0'},logoText:{fontSize:21,fontWeight:'900',color:'#2A1729'},brand:{fontSize:24,fontWeight:'900',letterSpacing:-.7},tagline:{fontSize:12,marginTop:1},content:{paddingHorizontal:16,paddingBottom:24,gap:12},eyebrow:{fontSize:11,fontWeight:'900',letterSpacing:2,marginTop:5},card:{borderWidth:1,borderRadius:20,padding:17,gap:9},cardTitle:{fontSize:18,fontWeight:'800'},body:{fontSize:14,lineHeight:21},button:{minHeight:47,borderRadius:13,paddingHorizontal:15,paddingVertical:12,alignItems:'center',justifyContent:'center',borderWidth:1,marginTop:4},buttonText:{fontSize:14,fontWeight:'800'},fieldWrap:{gap:6,marginTop:4},label:{fontSize:13,fontWeight:'700'},input:{borderWidth:1,borderRadius:12,paddingHorizontal:13,paddingVertical:12,fontSize:15},smallNote:{fontSize:12,lineHeight:18,marginVertical:8},disclaimer:{fontSize:11,lineHeight:16,textAlign:'center',paddingHorizontal:12,marginTop:8},nav:{borderTopWidth:1,flexDirection:'row',paddingTop:8,paddingBottom:Platform.OS==='ios'?4:8,paddingHorizontal:2},navItem:{flex:1,alignItems:'center',justifyContent:'center',gap:3,minHeight:49}
});