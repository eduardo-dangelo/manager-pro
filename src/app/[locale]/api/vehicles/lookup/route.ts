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

    // Helper function to extract tax status from DVLA data
    const extractTaxStatus = (dvla: any): string => {
      if (!dvla) {
        return '';
      }

      // Check for explicit taxStatus field
      if (dvla.taxStatus) {
        return dvla.taxStatus;
      }

      // Check for taxDueDate and calculate status
      if (dvla.taxDueDate) {
        const taxDueDate = new Date(dvla.taxDueDate);
        const now = new Date();
        if (taxDueDate > now) {
          return 'Taxed';
        } else {
          return 'Untaxed';
        }
      }

      // Check for SORN status
      if (dvla.sorn === true || dvla.sorn === 'true') {
        return 'SORN';
      }

      return '';
    };

    // Helper function to extract MOT status from MOT data
    const extractMotStatus = (mot: any): string => {
      if (!mot) {
        return '';
      }

      // Check for explicit motStatus field
      if (mot.motStatus) {
        return mot.motStatus;
      }

      // Check for motExpiryDate and calculate status
      if (mot.motExpiryDate) {
        const motExpiryDate = new Date(mot.motExpiryDate);
        const now = new Date();
        if (motExpiryDate > now) {
          return 'Valid';
        } else {
          return 'Expired';
        }
      }

      // Check for test history array
      if (Array.isArray(mot.motTests) && mot.motTests.length > 0) {
        const latestTest = mot.motTests[0]; // Assuming first is most recent
        if (latestTest.testResult === 'PASSED' || latestTest.testResult === 'PASS') {
          const expiryDate = latestTest.expiryDate ? new Date(latestTest.expiryDate) : null;
          if (expiryDate && expiryDate > new Date()) {
            return 'Valid';
          } else if (expiryDate) {
            return 'Expired';
          }
          return 'Valid';
        } else if (latestTest.testResult === 'FAILED' || latestTest.testResult === 'FAIL') {
          return 'Failed';
        }
      }

      return '';
    };

    // Helper function to merge fields, preferring non-empty values
    const mergeField = (dvlaValue: any, motValue: any, preferDvla = true): any => {
      const dvlaHasValue = dvlaValue !== null && dvlaValue !== undefined && dvlaValue !== '';
      const motHasValue = motValue !== null && motValue !== undefined && motValue !== '';

      if (preferDvla && dvlaHasValue) {
        return dvlaValue;
      }
      if (motHasValue) {
        return motValue;
      }
      if (dvlaHasValue) {
        return dvlaValue;
      }
      return '';
    };

    // Helper function to include all unique fields from a source
    const includeUniqueFields = (source: any, excludeKeys: string[]): Record<string, unknown> => {
      if (!source || typeof source !== 'object') {
        return {};
      }

      const uniqueFields: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(source)) {
        if (!excludeKeys.includes(key) && value !== null && value !== undefined) {
          uniqueFields[key] = value;
        }
      }
      return uniqueFields;
    };

    // Base mapped fields (overlapping fields)
    const baseVehicleData: Record<string, unknown> = {
      registration: (dvlaData as any)?.registrationNumber || normalizedRegistration,
      make: mergeField((dvlaData as any)?.make, (motData as any)?.make, true),
      model: mergeField((dvlaData as any)?.model, (motData as any)?.model, true),
      year: mergeField(
        (dvlaData as any)?.yearOfManufacture?.toString() || (dvlaData as any)?.monthOfFirstRegistration,
        (motData as any)?.yearOfManufacture?.toString() || (motData as any)?.year,
        true,
      ),
      color: mergeField((dvlaData as any)?.colour, (motData as any)?.colour || (motData as any)?.color, true),
      fuel: mergeField((dvlaData as any)?.fuelType, (motData as any)?.fuelType || (motData as any)?.fuel, true),
      vin: mergeField((dvlaData as any)?.vin, (motData as any)?.vin, true),
      engineSize: mergeField(
        typeof (dvlaData as any)?.engineCapacity === 'number'
          ? (dvlaData as any).engineCapacity.toString()
          : (dvlaData as any)?.engineCapacity,
        (motData as any)?.engineCapacity || (motData as any)?.engineSize,
        true,
      ),
      transmission: mergeField((dvlaData as any)?.transmission, (motData as any)?.transmission, true),
      mileage: mergeField((dvlaData as any)?.mileage, (motData as any)?.mileage, false),
      seats: mergeField((dvlaData as any)?.seats, (motData as any)?.seats, true),
      weight: mergeField(
        typeof (dvlaData as any)?.revenueWeight === 'number'
          ? (dvlaData as any).revenueWeight.toString()
          : (dvlaData as any)?.revenueWeight,
        (motData as any)?.weight,
        true,
      ),
      driveTrain: mergeField((dvlaData as any)?.wheelplan, (motData as any)?.driveTrain, true),
      engineNumber: mergeField((dvlaData as any)?.engineNumber, (motData as any)?.engineNumber, true),
      description: '',
      cost: '',
      taxStatus: extractTaxStatus(dvlaData),
      motStatus: extractMotStatus(motData),
    };

    // List of keys already mapped (to exclude from unique fields)
    const mappedKeys = Object.keys(baseVehicleData);

    // Include unique fields from DVLA
    const dvlaUniqueFields = includeUniqueFields(dvlaData, mappedKeys);
    for (const [key, value] of Object.entries(dvlaUniqueFields)) {
      baseVehicleData[`dvla_${key}`] = value;
    }

    // Include unique fields from MOT
    const motUniqueFields = includeUniqueFields(motData, mappedKeys);
    for (const [key, value] of Object.entries(motUniqueFields)) {
      baseVehicleData[`mot_${key}`] = value;
    }

    const vehicleData = baseVehicleData;

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
