import { useState, useEffect } from 'react';
import Login from '@/app/login/page';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import Icons from '@/components/icons';
import ClientSideModel from '@/components/realtime/ClientSideModel';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default function Index({ params }) {
  const supabase = createServerComponentClient({ cookies });
  const [user, setUser] = useState(null);
  const [model, setModel] = useState(null);
  const [images, setImages] = useState([]);
  const [samples, setSamples] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
        return;
      }
      setUser(data.user);
      if (!data.user) {
        return;
      }
      fetchModel(data.user);
    };

    fetchUser();
  }, []);

  const fetchModel = async (user) => {
    const { data, error } = await supabase
      .from('models')
      .select('*, images(*), samples(*)')
      .eq('id', Number(params.id))
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      console.error('Error fetching model:', error);
      redirect('/overview');
      return;
    }

    setModel(data);
    setImages(data.images || []);
    setSamples(data.samples || []);
  };

  if (!user) {
    return <Login />;
  }

  if (!model) {
    return <div>Loading...</div>;
  }

  return (
    <div id="train-model-container" className="w-full h-full">
      <div className="flex flex-row gap-4">
        <Link href="/overview" className="text-xs w-fit">
          <Button variant="outline" className="text-xs" size="sm">
            <FaArrowLeft className="mr-2" />
            Go Back
          </Button>
        </Link>
        <div className="flex flex-row gap-2 align-middle text-center items-center pb-4">
          <h1 className="text-xl">{model.name}</h1>
          <div>
            <Badge
              variant={model.status === 'finished' ? 'default' : 'secondary'}
              className="text-xs font-medium"
            >
              {model.status === 'processing' ? 'training' : model.status}
              {model.status === 'processing' && (
                <Icons.spinner className="h-4 w-4 animate-spin ml-2 inline-block" />
              )}
            </Badge>
          </div>
        </div>
      </div>

      <ClientSideModel samples={samples} serverModel={model} serverImages={images} />
    </div>
  );
}