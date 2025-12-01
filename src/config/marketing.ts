import { Box, Hammer, Home as HomeIcon, Truck, Warehouse, ShieldCheck, Clock } from "lucide-react";
import { ServiceItem, FeatureItem } from "@/types/marketing";

export const services: ServiceItem[] = [
  {
    title: "Transport de Matériaux",
    description: "Livraison rapide de matériaux de construction sur vos chantiers.",
    icon: Box,
  },
  {
    title: "Transport de Containers",
    description: "Solutions adaptées pour le déplacement de containers maritimes et de stockage.",
    icon: Warehouse,
  },
  {
    title: "Transport de Charpentes",
    description: "Transport spécialisé pour charpentes bois et métalliques de grandes dimensions.",
    icon: HomeIcon,
  },
  {
    title: "Transport de Machines",
    description: "Déplacement sécurisé de machines industrielles et engins de chantier.",
    icon: Hammer,
  },
  {
    title: "Modules Préfabriqués",
    description: "Logistique complète pour l'acheminement de modules et bungalows.",
    icon: Truck,
  },
];

export const features: FeatureItem[] = [
  {
    title: "Camion Adapté",
    description: "Une flotte moderne pour tous types de chargements.",
    icon: Truck,
  },
  {
    title: "Chargement Expert",
    description: "Personnel qualifié pour un chargement optimal.",
    icon: Box,
  },
  {
    title: "Sécurité Maximale",
    description: "Assurance et protocoles stricts pour vos biens.",
    icon: ShieldCheck,
  },
  {
    title: "Livraison Ponctuelle",
    description: "Respect des délais et suivi en temps réel.",
    icon: Clock,
  },
];