-- Create messages table for internal team communication
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    expediteur_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    destinataire_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    contenu TEXT NOT NULL,
    lu BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read messages they sent or received
CREATE POLICY "Users can read their own messages" ON public.messages
    FOR SELECT USING (
        expediteur_id = auth.uid() OR 
        destinataire_id = auth.uid()
    );

-- Policy: Users can insert messages as sender
CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (expediteur_id = auth.uid());

-- Policy: Users can update messages they received (mark as read)
CREATE POLICY "Users can update received messages" ON public.messages
    FOR UPDATE USING (destinataire_id = auth.uid());

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS messages_expediteur_id_idx ON public.messages(expediteur_id);
CREATE INDEX IF NOT EXISTS messages_destinataire_id_idx ON public.messages(destinataire_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS messages_lu_idx ON public.messages(lu);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_messages_updated_at
    BEFORE UPDATE ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
