import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  try {
    // We do a GET request and let it follow redirects. 
    // The final URL will be in response.url
    const response = await fetch(url, { method: 'GET', redirect: 'follow' });
    const finalUrl = response.url;

    // First, look for exact marker coordinates usually found in !3d and !4d
    const markerRegex = /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/;
    const markerMatch = finalUrl.match(markerRegex);

    if (markerMatch) {
      return NextResponse.json({
        latitude: parseFloat(markerMatch[1]),
        longitude: parseFloat(markerMatch[2]),
        finalUrl
      });
    }

    // Fallback to viewport center @lat,lng
    const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match = finalUrl.match(regex);

    if (match) {
      return NextResponse.json({
        latitude: parseFloat(match[1]),
        longitude: parseFloat(match[2]),
        finalUrl
      });
    } else {
      return NextResponse.json({ error: 'Could not find coordinates in the URL' }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
