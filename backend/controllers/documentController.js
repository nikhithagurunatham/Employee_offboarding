import Offboarding from "../models/Offboarding.js";
import {
  generateResignationAcceptanceLetter,
  generateNOC,
  generateExperienceRelievingLetter
} from "../utils/pdfGenerator.js";


const getOffboardingData = async (offboardingId) => {
  const offboarding = await Offboarding.findById(
    offboardingId
  ).populate("employee");

  if (!offboarding) {
    throw new Error("Offboarding record not found");
  }

  return offboarding;
};


export const downloadResignationAcceptance = async (
  req,
  res
) => {
  try {
    const offboarding = await getOffboardingData(
      req.params.offboardingId
    );

    generateResignationAcceptanceLetter(
      offboarding.employee,
      offboarding,
      res
    );
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};


export const downloadNOC = async (req, res) => {
  try {
    const offboarding = await getOffboardingData(
      req.params.offboardingId
    );

    generateNOC(
      offboarding.employee,
      offboarding,
      res
    );
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};


export const downloadExperienceRelieving = async (
  req,
  res
) => {
  try {
    const offboarding = await getOffboardingData(
      req.params.offboardingId
    );

    generateExperienceRelievingLetter(
      offboarding.employee,
      offboarding,
      res
    );
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};