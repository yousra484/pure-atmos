export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      commandes: {
        Row: {
          client_id: string | null
          date_creation: string | null
          id: string
          statut: string | null
          titre: string | null
        }
        Insert: {
          client_id?: string | null
          date_creation?: string | null
          id?: string
          statut?: string | null
          titre?: string | null
        }
        Update: {
          client_id?: string | null
          date_creation?: string | null
          id?: string
          statut?: string | null
          titre?: string | null
        }
        Relationships: []
      }
      contacts_experts: {
        Row: {
          client_id: string | null
          created_at: string
          email: string
          entreprise: string | null
          id: string
          message: string
          nom: string
          statut: string
          sujet: string
          telephone: string | null
          type_consultation: string
          updated_at: string
          urgence: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          email: string
          entreprise?: string | null
          id?: string
          message: string
          nom: string
          statut?: string
          sujet: string
          telephone?: string | null
          type_consultation: string
          updated_at?: string
          urgence?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          email?: string
          entreprise?: string | null
          id?: string
          message?: string
          nom?: string
          statut?: string
          sujet?: string
          telephone?: string | null
          type_consultation?: string
          updated_at?: string
          urgence?: string
        }
        Relationships: []
      }
      demandes_etudes: {
        Row: {
          budget_estime: string | null
          client_id: string
          contact_email: string
          contact_nom: string
          contact_telephone: string | null
          created_at: string
          delai_souhaite: string | null
          description_projet: string
          id: string
          nom_entreprise: string
          secteur_activite: string
          statut: string
          type_etude: string
          updated_at: string
          zone_geographique: string
        }
        Insert: {
          budget_estime?: string | null
          client_id: string
          contact_email: string
          contact_nom: string
          contact_telephone?: string | null
          created_at?: string
          delai_souhaite?: string | null
          description_projet: string
          id?: string
          nom_entreprise: string
          secteur_activite: string
          statut?: string
          type_etude: string
          updated_at?: string
          zone_geographique: string
        }
        Update: {
          budget_estime?: string | null
          client_id?: string
          contact_email?: string
          contact_nom?: string
          contact_telephone?: string | null
          created_at?: string
          delai_souhaite?: string | null
          description_projet?: string
          id?: string
          nom_entreprise?: string
          secteur_activite?: string
          statut?: string
          type_etude?: string
          updated_at?: string
          zone_geographique?: string
        }
        Relationships: []
      }
      factures: {
        Row: {
          demande_etude_id: string | null
          date_emission: string | null
          id: string
          montant: number | null
          statut: string | null
        }
        Insert: {
          demande_etude_id?: string | null
          date_emission?: string | null
          id?: string
          montant?: number | null
          statut?: string | null
        }
        Update: {
          demande_etude_id?: string | null
          date_emission?: string | null
          id?: string
          montant?: number | null
          statut?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "factures_demande_etude_id_fkey"
            columns: ["demande_etude_id"]
            isOneToOne: false
            referencedRelation: "demandes_etudes"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          demande_etude_id: string | null
          date_debut: string | null
          date_fin: string | null
          id: string
          intervenant_id: string | null
          statut: string | null
          lieu_intervention: string | null
          description: string | null
          latitude: number | null
          longitude: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          demande_etude_id?: string | null
          date_debut?: string | null
          date_fin?: string | null
          id?: string
          intervenant_id?: string | null
          statut?: string | null
          lieu_intervention?: string | null
          description?: string | null
          latitude?: number | null
          longitude?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          demande_etude_id?: string | null
          date_debut?: string | null
          date_fin?: string | null
          id?: string
          intervenant_id?: string | null
          statut?: string | null
          lieu_intervention?: string | null
          description?: string | null
          latitude?: number | null
          longitude?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "missions_demande_etude_id_fkey"
            columns: ["demande_etude_id"]
            isOneToOne: false
            referencedRelation: "demandes_etudes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          entreprise: string | null
          experience: number | null
          id: string
          nom: string
          pays: string | null
          prenom: string
          specialisation: string | null
          telephone: string | null
          type_compte: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          entreprise?: string | null
          experience?: number | null
          id?: string
          nom: string
          pays?: string | null
          prenom: string
          specialisation?: string | null
          telephone?: string | null
          type_compte: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          entreprise?: string | null
          experience?: number | null
          id?: string
          nom?: string
          pays?: string | null
          prenom?: string
          specialisation?: string | null
          telephone?: string | null
          type_compte?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      rapports: {
        Row: {
          demande_etude_id: string | null
          date_publication: string | null
          fichier_url: string | null
          id: string
          langue: string | null
          mission_id: string | null
          titre: string | null
          contenu: string | null
          type_rapport: string | null
          statut: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          demande_etude_id?: string | null
          date_publication?: string | null
          fichier_url?: string | null
          id?: string
          langue?: string | null
          mission_id?: string | null
          titre?: string | null
          contenu?: string | null
          type_rapport?: string | null
          statut?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          demande_etude_id?: string | null
          date_publication?: string | null
          fichier_url?: string | null
          id?: string
          langue?: string | null
          mission_id?: string | null
          titre?: string | null
          contenu?: string | null
          type_rapport?: string | null
          statut?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rapports_demande_etude_id_fkey"
            columns: ["demande_etude_id"]
            isOneToOne: false
            referencedRelation: "demandes_etudes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rapports_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      vue_clients: {
        Row: {
          created_at: string | null
          email: string | null
          entreprise: string | null
          experience: number | null
          id: string | null
          nom: string | null
          pays: string | null
          prenom: string | null
          specialisation: string | null
          telephone: string | null
          type_compte: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          entreprise?: string | null
          experience?: number | null
          id?: string | null
          nom?: string | null
          pays?: string | null
          prenom?: string | null
          specialisation?: string | null
          telephone?: string | null
          type_compte?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          entreprise?: string | null
          experience?: number | null
          id?: string | null
          nom?: string | null
          pays?: string | null
          prenom?: string | null
          specialisation?: string | null
          telephone?: string | null
          type_compte?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      vue_intervenents: {
        Row: {
          created_at: string | null
          email: string | null
          entreprise: string | null
          experience: number | null
          id: string | null
          nom: string | null
          pays: string | null
          prenom: string | null
          specialisation: string | null
          telephone: string | null
          type_compte: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          entreprise?: string | null
          experience?: number | null
          id?: string | null
          nom?: string | null
          pays?: string | null
          prenom?: string | null
          specialisation?: string | null
          telephone?: string | null
          type_compte?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          entreprise?: string | null
          experience?: number | null
          id?: string | null
          nom?: string | null
          pays?: string | null
          prenom?: string | null
          specialisation?: string | null
          telephone?: string | null
          type_compte?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
