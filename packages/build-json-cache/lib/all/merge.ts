/**
 * Created by user on 2020/2/23.
 */

import { readJSON, outputJSON } from 'fs-extra';
import { join } from 'path';
import { __root } from '../../__root';
import Bluebird from 'bluebird';
import { ICachedJSONRowPlus } from '../types';
import { cn2tw_min } from 'cjk-conv/lib/zh/convert/min';

export default Bluebird
	.props([
		'demonovel',
		'dmzj',
		'esjzone',
		'masiro',
		'wenku8',
	].reduce((a, b) =>
	{

		a[b] = readJSON(join(__root, '.cache', 'build', b + '.json')) as any;

		return a;
	}, {} as Record<string, Record<string, ICachedJSONRowPlus>>))
	.then(data =>
	{

		return Bluebird
			.resolve(Object.keys(data))
			.reduce(async (a, b) =>
			{

				await Bluebird
					.resolve(Object.keys(data[b]))
					.each(uuid =>
					{
						let item = data[b][uuid];

						item.title = cn2tw_min(item.title, {
							safe: false,
						});
						if (item.content)
						{
							item.content = cn2tw_min(item.content, {
								safe: false,
							})
						}

						return outputJSON(join(__root, '.cache', 'split', `./${uuid}.json`), item);
					})
				;

				return Object.assign(a, data[b]) as Record<string, ICachedJSONRowPlus>
			}, {} as Record<string, ICachedJSONRowPlus>)
	})
	.then(data =>
	{

		let arr = Object.values(data);

		arr = arr.sort((a, b) =>
		{
			return b.updated - a.updated
		});

		return Bluebird.all([
			outputJSON(join(__root, '.cache', `./build.all.json`), data),
			outputJSON(join(__root, '.cache', `./build.all.array.json`), arr),
		])
	})
;
