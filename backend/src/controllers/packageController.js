import * as packageService from '../services/packageService.js';
import { success } from '../utils/apiResponse.js';

export const list = async (req, res, next) => {
  try {
    success(res, await packageService.listPackages());
  } catch (e) {
    next(e);
  }
};

export const create = async (req, res, next) => {
  try {
    success(res, await packageService.createPackage(req.body), 'Package created', 201);
  } catch (e) {
    next(e);
  }
};

export const update = async (req, res, next) => {
  try {
    success(res, await packageService.updatePackage(req.params.id, req.body), 'Package updated');
  } catch (e) {
    next(e);
  }
};

export const remove = async (req, res, next) => {
  try {
    await packageService.deletePackage(req.params.id);
    success(res, null, 'Package deleted');
  } catch (e) {
    next(e);
  }
};
