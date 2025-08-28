import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Simple auth check
    const authHeader = request.headers.get('authorization') || request.headers.get('cookie');
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('🔍 Checking nodemailer installation...');

    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      checks: []
    };

    // Test 1: Check if nodemailer is available via require
    try {
      console.log('Test 1: Trying require("nodemailer")...');
      const nodemailer = require('nodemailer');
      console.log('✅ require("nodemailer") successful');
      
      diagnostics.checks.push({
        test: 'require("nodemailer")',
        status: 'success',
        keys: Object.keys(nodemailer),
        hasCreateTransporter: typeof nodemailer.createTransporter === 'function'
      });

      // Test 2: Try to access createTransporter
      if (typeof nodemailer.createTransporter === 'function') {
        console.log('✅ createTransporter is available');
        diagnostics.checks.push({
          test: 'createTransporter function',
          status: 'success',
          type: typeof nodemailer.createTransporter
        });
      } else {
        console.log('❌ createTransporter is not a function');
        diagnostics.checks.push({
          test: 'createTransporter function',
          status: 'error',
          type: typeof nodemailer.createTransporter,
          message: 'createTransporter is not a function'
        });
      }

    } catch (error) {
      console.log('❌ require("nodemailer") failed:', error);
      diagnostics.checks.push({
        test: 'require("nodemailer")',
        status: 'error',
        error: error instanceof Error ? error.message : String(error)
      });
    }

    // Test 3: Try dynamic import
    try {
      console.log('Test 2: Trying dynamic import...');
      const nodemailerModule = await import('nodemailer');
      console.log('✅ Dynamic import successful');
      
      diagnostics.checks.push({
        test: 'dynamic import',
        status: 'success',
        hasDefault: !!nodemailerModule.default,
        defaultKeys: nodemailerModule.default ? Object.keys(nodemailerModule.default) : null,
        moduleKeys: Object.keys(nodemailerModule)
      });

    } catch (error) {
      console.log('❌ Dynamic import failed:', error);
      diagnostics.checks.push({
        test: 'dynamic import',
        status: 'error',
        error: error instanceof Error ? error.message : String(error)
      });
    }

    // Test 4: Check package.json for nodemailer
    try {
      console.log('Test 3: Checking package installation...');
      const packageJson = require('../../../../../../package.json');
      const hasNodemailer = packageJson.dependencies?.nodemailer || packageJson.devDependencies?.nodemailer;
      
      diagnostics.checks.push({
        test: 'package.json check',
        status: hasNodemailer ? 'success' : 'warning',
        version: hasNodemailer || 'not found'
      });

    } catch (error) {
      diagnostics.checks.push({
        test: 'package.json check',
        status: 'error',
        error: error instanceof Error ? error.message : String(error)
      });
    }

    return NextResponse.json({
      success: true,
      diagnostics
    });

  } catch (error) {
    console.error("Nodemailer check error:", error);
    return NextResponse.json(
      { 
        error: "Check failed",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}