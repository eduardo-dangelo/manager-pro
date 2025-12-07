import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { logger } from '@/libs/Logger';

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
    
    console.log('=== Vehicle Lookup Request ===');
    console.log('Registration:', normalizedRegistration);
    console.log('User ID:', user.id);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock API response - This simulates what a real API would return
    // When integrating a real API, replace this section with the actual API call
    const mockApiResponse = {
      registration: normalizedRegistration,
      make: 'BMW',
      model: '320d',
      year: '2018',
      color: 'Black',
      fuel: 'Diesel',
      vin: 'WBA8A9C58JG123456',
      engineSize: '2.0L',
      transmission: 'Automatic',
      mileage: '45000',
      seats: '5',
      weight: '1520',
      driveTrain: 'Rear Wheel Drive',
      engineNumber: 'N47D20C',
      description: 'BMW 320d Saloon, 2.0L Diesel, Automatic',
      cost: '',
    };

    console.log('=== Mock API Response ===');
    console.log(JSON.stringify(mockApiResponse, null, 2));

    // Map mock API response to our vehicle data structure
    // When using a real API, map the actual API response fields here
    const vehicleData = {
      registration: mockApiResponse.registration || normalizedRegistration,
      make: mockApiResponse.make || '',
      model: mockApiResponse.model || '',
      year: mockApiResponse.year || '',
      color: mockApiResponse.color || '',
      fuel: mockApiResponse.fuel || '',
      vin: mockApiResponse.vin || '',
      engineSize: mockApiResponse.engineSize || '',
      transmission: mockApiResponse.transmission || '',
      mileage: mockApiResponse.mileage || '',
      seats: mockApiResponse.seats || '',
      weight: mockApiResponse.weight || '',
      driveTrain: mockApiResponse.driveTrain || '',
      engineNumber: mockApiResponse.engineNumber || '',
      description: mockApiResponse.description || '',
      cost: mockApiResponse.cost || '',
    };

    console.log('=== Mapped Vehicle Data ===');
    console.log(JSON.stringify(vehicleData, null, 2));

    const response = { vehicle: vehicleData };
    console.log('=== Final API Response ===');
    console.log(JSON.stringify(response, null, 2));

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


