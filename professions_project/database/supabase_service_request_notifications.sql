-- SQL Script: Automatic notifications on service requests insertion
-- Run this script in Supabase SQL Editor to enable automatic notification triggers

CREATE OR REPLACE FUNCTION public.notify_worker_on_service_request()
RETURNS TRIGGER AS $$
DECLARE
    v_client_name TEXT;
    v_short_desc TEXT;
BEGIN
    -- Fetch client profile full_name
    SELECT full_name INTO v_client_name
    FROM public.profiles
    WHERE id = NEW.client_id;

    IF v_client_name IS NULL OR v_client_name = '' THEN
        v_client_name := 'أحد العملاء';
    END IF;

    -- Shorten description for notification message
    v_short_desc := substring(NEW.description from 1 for 60);
    IF length(NEW.description) > 60 THEN
        v_short_desc := v_short_desc || '...';
    END IF;

    -- Insert notification for the worker
    INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        link
    ) VALUES (
        NEW.worker_id,
        '🛠️ طلب خدمة جديدة!',
        'طلب منك ' || v_client_name || ' خدمة جديدة: "' || v_short_desc || '"',
        'info',
        '/services/dashboard'
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger on service_requests table
DROP TRIGGER IF EXISTS on_service_request_created ON public.service_requests;
CREATE TRIGGER on_service_request_created
    AFTER INSERT ON public.service_requests
    FOR EACH ROW EXECUTE FUNCTION public.notify_worker_on_service_request();
