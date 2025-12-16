import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { logger } from '@/libs/Logger';
import { fetchDvlaVehicle, fetchMotHistory } from '@/services/vehicleLookupService';

export const POST = async (request: Request) => {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body', details: parseError instanceof Error ? parseError.message : String(parseError) },
        { status: 400 },
      );
    }

    const { registration } = body;

    if (!registration || typeof registration !== 'string') {
      return NextResponse.json(
        { error: 'Registration number is required' },
        { status: 400 },
      );
    }

    // Normalize registration number (remove spaces, convert to uppercase)
    const normalizedRegistration = registration.trim().toUpperCase().replace(/\s+/g, '');

    // TODO: Integrate with UK vehicle lookup API
    // Example APIs that could be used:
    // - VehicleSmart API (https://www.vehiclesmart.com/)
    // - DVLA API (requires registration)
    // - CarCheck API
    //
    // For now, this is a placeholder that returns a structured response
    // Replace this section with actual API integration

    // Example API call structure:
    // const apiKey = process.env.VEHICLE_LOOKUP_API_KEY;
    // const response = await fetch(
    //   `https://api.example.com/vehicle-lookup?registration=${normalizedRegistration}`,
    //   {
    //     headers: {
    //       'Authorization': `Bearer ${apiKey}`,
    //       'Content-Type': 'application/json',
    //     },
    //   }
    // );
    //
    // if (!response.ok) {
    //   throw new Error('Vehicle lookup API error');
    // }
    //
    // const apiData = await response.json();
    //
    // Map API response to our vehicle data structure
    // const vehicleData = {
    //   registration: apiData.registration || normalizedRegistration,
    //   make: apiData.make || apiData.manufacturer || '',
    //   model: apiData.model || '',
    //   year: apiData.year || apiData.yearOfManufacture || '',
    //   color: apiData.colour || apiData.color || '',
    //   fuel: apiData.fuelType || apiData.fuel || '',
    //   vin: apiData.vin || apiData.chassisNumber || '',
    //   engineSize: apiData.engineSize || apiData.engineCapacity || '',
    //   transmission: apiData.transmission || '',
    //   mileage: apiData.mileage || '',
    //   seats: apiData.seats || apiData.numberOfSeats || '',
    //   weight: apiData.weight || apiData.massInService || '',
    //   driveTrain: apiData.driveTrain || apiData.drivingAxle || '',
    //   engineNumber: apiData.engineNumber || '',
    //   description: apiData.description || '',
    //   cost: apiData.cost || '',
    // };

    // TODO: Replace this mock section with actual UK vehicle lookup API integration
    // Example APIs: VehicleSmart, DVLA, CarCheck

    console.warn('=== Vehicle Lookup Request ===', {
      registration: normalizedRegistration,
      userId: user.id,
    });

    // Call DVLA and MOT history APIs in parallel
    const [dvlaResult, motResult] = await Promise.allSettled([
      fetchDvlaVehicle(normalizedRegistration),
      fetchMotHistory(normalizedRegistration),
    ]);

    const dvlaData = dvlaResult.status === 'fulfilled' ? dvlaResult.value : null;
    const motData = motResult.status === 'fulfilled' ? motResult.value : null;

    if (dvlaResult.status === 'rejected') {
      console.error('DVLA lookup failed:', dvlaResult.reason);
    }
    if (motResult.status === 'rejected') {
      console.error('MOT history lookup failed:', motResult.reason);
    }

    console.warn('=== DVLA API Response ===', dvlaData);

    console.warn('=== MOT History API Response ===', motData);

    // Map DVLA (and optionally MOT) data into the vehicle data structure used by the UI
    const vehicleData = {
      registration: (dvlaData as any)?.registrationNumber || normalizedRegistration,
      make: (dvlaData as any)?.make || '',
      model: (dvlaData as any)?.model || '',
      year:
        (dvlaData as any)?.yearOfManufacture?.toString()
        || (dvlaData as any)?.monthOfFirstRegistration
        || '',
      color: (dvlaData as any)?.colour || '',
      fuel: (dvlaData as any)?.fuelType || '',
      vin: (dvlaData as any)?.vin || '',
      engineSize:
        typeof (dvlaData as any)?.engineCapacity === 'number'
          ? (dvlaData as any).engineCapacity.toString()
          : (dvlaData as any)?.engineCapacity || '',
      transmission: '',
      mileage: '',
      seats: '',
      weight:
        typeof (dvlaData as any)?.revenueWeight === 'number'
          ? (dvlaData as any).revenueWeight.toString()
          : (dvlaData as any)?.revenueWeight || '',
      driveTrain: (dvlaData as any)?.wheelplan || '',
      engineNumber: '',
      description: '',
      cost: '',
    };

    console.warn('=== Mapped Vehicle Data ===', vehicleData);

    const response = {
      vehicle: vehicleData,
      dvla: dvlaData,
      mot: motData,
    };
    console.warn('=== Final API Response ===', response);

    try {
      logger.info('Vehicle lookup successful', {
        registration: normalizedRegistration,
        make: vehicleData.make,
        model: vehicleData.model,
      });
    } catch (loggerError) {
      console.warn('Logger not available, continuing without logging:', loggerError);
    }

    return NextResponse.json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error('Error looking up vehicle:', errorMessage);
    console.error('Error stack:', errorStack);
    console.error('Full error:', error);

    try {
      logger.error(`Error looking up vehicle: ${errorMessage}`);
    } catch (loggerError) {
      console.error('Failed to log error:', loggerError);
    }

    return NextResponse.json(
      {
        error: 'Failed to lookup vehicle',
        details: errorMessage,
      },
      { status: 500 },
    );
  }
};
